import type {
  Order,
  ManufacturingStatus,
  OrderPaymentRecord,
  OrderHistoryEvent,
  OrderMeasurementSnapshot,
  Measurement,
} from '../types';
import { OrderEngine } from './orderEngine';
import { MOCK_ORDERS, MOCK_MEASUREMENTS_COSTUME } from '../data/mockData';

const ORDERS_KEY = 'taylaxis_orders_v2';

export class OrderService {
  private static listeners: Array<(orders: Order[]) => void> = [];

  /**
   * Subscribe to order updates
   */
  static subscribe(callback: (orders: Order[]) => void): () => void {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== callback);
    };
  }

  private static notify() {
    const orders = this.getOrders();
    this.listeners.forEach((l) => l(orders));
  }

  /**
   * Seed initial orders with V1 Engine properties if empty
   */
  private static seedInitialOrders(rawList: Order[]): Order[] {
    return rawList.map((ord) => {
      const mfgStatus = ord.manufacturingStatus || OrderEngine.mapLegacyToManufacturingStatus(ord.status);
      const paymentStatus = ord.paymentStatus || OrderEngine.calculatePaymentStatus(ord.priceFCFA, ord.paidFCFA);
      const dueDateStatus = ord.dueDateStatus || OrderEngine.calculateDueDateStatus(ord.deliveryDate, mfgStatus);
      const priority = ord.priority || OrderEngine.calculatePriority(ord, mfgStatus, paymentStatus, dueDateStatus);

      const initialPayments: OrderPaymentRecord[] = ord.paymentHistory || [
        {
          id: `pay_init_${ord.id}`,
          orderId: ord.id,
          amountFCFA: ord.paidFCFA,
          date: ord.orderDate || '10 Mai 2024',
          paymentMethod: 'ESPECES',
          note: 'Acompte initial à la commande',
        },
      ];

      const initialTimeline: OrderHistoryEvent[] = ord.eventTimeline || [
        {
          id: `evt_1_${ord.id}`,
          orderId: ord.id,
          timestamp: `${ord.orderDate || '10 Mai 2024'} • 09:00`,
          type: 'COMMANDE_CREEE',
          title: 'Commande créée',
          description: `Création de la commande ${ord.title} (${ord.orderNumber}) pour un montant de ${ord.priceFCFA.toLocaleString('fr-FR')} FCFA.`,
          performedBy: 'Atelier Taylaxis',
        },
        {
          id: `evt_2_${ord.id}`,
          orderId: ord.id,
          timestamp: `${ord.orderDate || '10 Mai 2024'} • 09:05`,
          type: 'PAIEMENT_ENREGISTRE',
          title: `Acompte reçu (${ord.paidFCFA.toLocaleString('fr-FR')} FCFA)`,
          description: `Règlement initial effectué par espèces. Solde restant : ${ord.balanceFCFA.toLocaleString('fr-FR')} FCFA.`,
          performedBy: 'Atelier Taylaxis',
        },
      ];

      const initialSnapshot: OrderMeasurementSnapshot = ord.measurementSnapshot || {
        takenAt: ord.orderDate || '10 Mai 2024',
        measurements: MOCK_MEASUREMENTS_COSTUME,
      };

      return {
        ...ord,
        manufacturingStatus: mfgStatus,
        paymentStatus,
        dueDateStatus,
        priority,
        paymentHistory: initialPayments,
        eventTimeline: initialTimeline,
        measurementSnapshot: initialSnapshot,
      };
    });
  }

  /**
   * Get all orders from storage
   */
  static getOrders(): Order[] {
    try {
      const stored = localStorage.getItem(ORDERS_KEY);
      let parsed: Order[];
      if (!stored) {
        parsed = this.seedInitialOrders(MOCK_ORDERS);
        localStorage.setItem(ORDERS_KEY, JSON.stringify(parsed));
      } else {
        parsed = JSON.parse(stored);
      }
      // Re-hydrate dynamically calculated statuses (due date status depends on real clock)
      return parsed.map((ord) => {
        const mfg = ord.manufacturingStatus || OrderEngine.mapLegacyToManufacturingStatus(ord.status);
        const pay = OrderEngine.calculatePaymentStatus(ord.priceFCFA, ord.paidFCFA);
        const due = OrderEngine.calculateDueDateStatus(ord.deliveryDate, mfg);
        const pri = OrderEngine.calculatePriority(ord, mfg, pay, due);
        const legacyStatus = OrderEngine.mapManufacturingStatusToLegacy(mfg, due === 'EN_RETARD');

        return {
          ...ord,
          manufacturingStatus: mfg,
          paymentStatus: pay,
          dueDateStatus: due,
          priority: pri,
          status: legacyStatus,
        };
      });
    } catch (e) {
      console.error('Failed to load orders from localStorage:', e);
      return this.seedInitialOrders(MOCK_ORDERS);
    }
  }

  /**
   * Save orders list to storage
   */
  static saveOrders(orders: Order[]) {
    try {
      localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
      this.notify();
    } catch (e) {
      console.error('Failed to save orders to localStorage:', e);
    }
  }

  /**
   * Generate next order number
   */
  static generateOrderNumber(): string {
    const orders = this.getOrders();
    const count = orders.length + 1;
    return `#${String(count).padStart(3, '0')}`;
  }

  /**
   * Save or update a single order
   */
  static saveOrder(order: Order): void {
    const orders = this.getOrders();
    const idx = orders.findIndex((o) => o.id === order.id);
    if (idx >= 0) {
      orders[idx] = order;
    } else {
      orders.unshift(order);
    }
    this.saveOrders(orders);
  }

  /**
   * Get order by ID
   */
  static getOrderById(orderId: string): Order | undefined {
    return this.getOrders().find((o) => o.id === orderId);
  }

  /**
   * Update manufacturing status with transition guard & timeline event
   */
  static updateManufacturingStatus(
    orderId: string,
    nextStatus: ManufacturingStatus,
    performedBy: string = 'Atelier Taylaxis'
  ): { success: boolean; error?: string; order?: Order } {
    const orders = this.getOrders();
    const index = orders.findIndex((o) => o.id === orderId);
    if (index === -1) {
      return { success: false, error: 'Commande introuvable' };
    }

    const currentOrder = orders[index];
    const currentMfgStatus = currentOrder.manufacturingStatus || OrderEngine.mapLegacyToManufacturingStatus(currentOrder.status);

    const guard = OrderEngine.canTransitionTo(currentMfgStatus, nextStatus);
    if (!guard.allowed) {
      return { success: false, error: guard.reason };
    }

    const nowStr = new Date().toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });

    const statusLabels: Record<ManufacturingStatus, string> = {
      BROUILLON: 'Brouillon',
      CONFIRMEE: 'Confirmée',
      EN_COURS: 'En confection',
      PRETE: 'Prête à l\'atelier',
      A_LIVRER: 'En cours de livraison',
      LIVREE: 'Livrée au client',
      TERMINEE: 'Terminée et clôturée',
    };

    const newEvent: OrderHistoryEvent = {
      id: `evt_${Date.now()}`,
      orderId,
      timestamp: nowStr,
      type: 'CHANGEMENT_STATUT',
      title: `Statut passé à : ${statusLabels[nextStatus]}`,
      description: `Transition de statut validée : ${statusLabels[currentMfgStatus]} ➔ ${statusLabels[nextStatus]}.`,
      performedBy,
    };

    const updatedDueDateStatus = OrderEngine.calculateDueDateStatus(currentOrder.deliveryDate, nextStatus);
    const updatedPaymentStatus = OrderEngine.calculatePaymentStatus(currentOrder.priceFCFA, currentOrder.paidFCFA);
    const updatedPriority = OrderEngine.calculatePriority(currentOrder, nextStatus, updatedPaymentStatus, updatedDueDateStatus);
    const updatedLegacyStatus = OrderEngine.mapManufacturingStatusToLegacy(nextStatus, updatedDueDateStatus === 'EN_RETARD');

    const updatedOrder: Order = {
      ...currentOrder,
      manufacturingStatus: nextStatus,
      paymentStatus: updatedPaymentStatus,
      dueDateStatus: updatedDueDateStatus,
      priority: updatedPriority,
      status: updatedLegacyStatus,
      eventTimeline: [newEvent, ...(currentOrder.eventTimeline || [])],
    };

    orders[index] = updatedOrder;
    this.saveOrders(orders);

    return { success: true, order: updatedOrder };
  }

  /**
   * Record a financial payment on an order
   */
  static addPayment(
    orderId: string,
    amountFCFA: number,
    paymentMethod: OrderPaymentRecord['paymentMethod'] = 'ESPECES',
    note?: string,
    reference?: string,
    performedBy: string = 'Atelier Taylaxis'
  ): { success: boolean; error?: string; order?: Order } {
    const orders = this.getOrders();
    const index = orders.findIndex((o) => o.id === orderId);
    if (index === -1) {
      return { success: false, error: 'Commande introuvable' };
    }

    const currentOrder = orders[index];
    const safeAmount = Math.max(0, amountFCFA || 0);

    if (safeAmount <= 0) {
      return { success: false, error: 'Veuillez saisir un montant supérieur à 0 FCFA.' };
    }

    const newPaid = currentOrder.paidFCFA + safeAmount;
    const newBalance = Math.max(0, currentOrder.priceFCFA - newPaid);
    const newPaymentStatus = OrderEngine.calculatePaymentStatus(currentOrder.priceFCFA, newPaid);

    const nowStr = new Date().toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });

    const newPaymentRecord: OrderPaymentRecord = {
      id: `pay_${Date.now()}`,
      orderId,
      amountFCFA: safeAmount,
      date: nowStr,
      paymentMethod,
      reference,
      note,
    };

    const newEvent: OrderHistoryEvent = {
      id: `evt_pay_${Date.now()}`,
      orderId,
      timestamp: nowStr,
      type: 'PAIEMENT_ENREGISTRE',
      title: `Paiement reçu (${safeAmount.toLocaleString('fr-FR')} FCFA)`,
      description: `Règlement via ${paymentMethod}. Reste à payer : ${newBalance.toLocaleString('fr-FR')} FCFA.`,
      performedBy,
    };

    const currentMfg = currentOrder.manufacturingStatus || OrderEngine.mapLegacyToManufacturingStatus(currentOrder.status);
    const currentDue = OrderEngine.calculateDueDateStatus(currentOrder.deliveryDate, currentMfg);
    const updatedPriority = OrderEngine.calculatePriority(
      { ...currentOrder, paidFCFA: newPaid, balanceFCFA: newBalance },
      currentMfg,
      newPaymentStatus,
      currentDue
    );

    const updatedOrder: Order = {
      ...currentOrder,
      paidFCFA: newPaid,
      balanceFCFA: newBalance,
      paymentStatus: newPaymentStatus,
      priority: updatedPriority,
      paymentHistory: [newPaymentRecord, ...(currentOrder.paymentHistory || [])],
      eventTimeline: [newEvent, ...(currentOrder.eventTimeline || [])],
    };

    orders[index] = updatedOrder;
    this.saveOrders(orders);

    return { success: true, order: updatedOrder };
  }

  /**
   * Create a new order with frozen measurement snapshot
   */
  static createOrder(
    newOrderData: Omit<Order, 'id' | 'orderNumber' | 'status' | 'balanceFCFA'>,
    clientMeasurements: Measurement[] = []
  ): Order {
    const orders = this.getOrders();
    const count = orders.length + 25;
    const orderNumber = `#${String(count).padStart(3, '0')}`;
    const id = `ord_${Date.now()}`;

    const balanceFCFA = Math.max(0, newOrderData.priceFCFA - newOrderData.paidFCFA);
    const mfgStatus: ManufacturingStatus = 'CONFIRMEE';
    const paymentStatus = OrderEngine.calculatePaymentStatus(newOrderData.priceFCFA, newOrderData.paidFCFA);
    const dueDateStatus = OrderEngine.calculateDueDateStatus(newOrderData.deliveryDate, mfgStatus);
    const priority = OrderEngine.calculatePriority(newOrderData, mfgStatus, paymentStatus, dueDateStatus);
    const legacyStatus = OrderEngine.mapManufacturingStatusToLegacy(mfgStatus, dueDateStatus === 'EN_RETARD');

    const nowStr = new Date().toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });

    const initialTimeline: OrderHistoryEvent[] = [
      {
        id: `evt_1_${id}`,
        orderId: id,
        timestamp: nowStr,
        type: 'COMMANDE_CREEE',
        title: 'Commande enregistrée',
        description: `Création de la commande ${newOrderData.title} (${orderNumber}) de ${newOrderData.priceFCFA.toLocaleString('fr-FR')} FCFA.`,
        performedBy: 'Atelier Taylaxis',
      },
    ];

    if (newOrderData.paidFCFA > 0) {
      initialTimeline.unshift({
        id: `evt_2_${id}`,
        orderId: id,
        timestamp: nowStr,
        type: 'PAIEMENT_ENREGISTRE',
        title: `Acompte initial (${newOrderData.paidFCFA.toLocaleString('fr-FR')} FCFA)`,
        description: `Acompte perçu lors de la commande. Solde restant : ${balanceFCFA.toLocaleString('fr-FR')} FCFA.`,
        performedBy: 'Atelier Taylaxis',
      });
    }

    const createdOrder: Order = {
      ...newOrderData,
      id,
      orderNumber,
      balanceFCFA,
      status: legacyStatus,
      manufacturingStatus: mfgStatus,
      paymentStatus,
      dueDateStatus,
      priority,
      paymentHistory:
        newOrderData.paidFCFA > 0
          ? [
              {
                id: `pay_${id}`,
                orderId: id,
                amountFCFA: newOrderData.paidFCFA,
                date: nowStr,
                paymentMethod: 'ESPECES',
                note: 'Acompte initial',
              },
            ]
          : [],
      eventTimeline: initialTimeline,
      measurementSnapshot: {
        takenAt: nowStr,
        measurements: clientMeasurements.length > 0 ? clientMeasurements : MOCK_MEASUREMENTS_COSTUME,
      },
    };

    orders.unshift(createdOrder);
    this.saveOrders(orders);

    return createdOrder;
  }
}
