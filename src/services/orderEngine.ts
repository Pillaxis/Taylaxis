import type {
  Order,
  ManufacturingStatus,
  PaymentStatus,
  DueDateStatus,
  OrderPriority,
  StatusType,
} from '../types';

export interface ContextualAction {
  id: string;
  label: string;
  actionKey:
    | 'CONFIRMER_COMMANDE'
    | 'DEMARRER_CONFECTION'
    | 'MARQUER_PRETE'
    | 'PREVENIR_CLIENT'
    | 'MARQUER_A_LIVRER'
    | 'MARQUER_LIVREE'
    | 'ENCAISSER_SOLDE'
    | 'TERMINER_COMMANDE'
    | 'APPELER_CLIENT'
    | 'WHATSAPP_CLIENT'
    | 'VOIR_MENSURATIONS'
    | 'VOIR_CLIENT'
    | 'ANNULER_COMMANDE';
  intent: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'secondary';
  iconName: string;
  description?: string;
}

export interface NextActionResult {
  primaryAction: ContextualAction | null;
  secondaryActions: ContextualAction[];
}

export class OrderEngine {
  /**
   * Map legacy status to V1 ManufacturingStatus
   */
  static mapLegacyToManufacturingStatus(legacyStatus: StatusType): ManufacturingStatus {
    switch (legacyStatus) {
      case 'new':
        return 'BROUILLON';
      case 'progress':
        return 'EN_COURS';
      case 'review':
        return 'EN_COURS';
      case 'ready':
        return 'PRETE';
      case 'to_deliver':
        return 'A_LIVRER';
      case 'done':
        return 'LIVREE';
      case 'late':
        return 'EN_COURS';
      case 'cancelled':
        return 'TERMINEE';
      default:
        return 'EN_COURS';
    }
  }

  /**
   * Map V1 ManufacturingStatus back to legacy StatusType for backwards compatibility
   */
  static mapManufacturingStatusToLegacy(
    mfgStatus: ManufacturingStatus,
    isLate: boolean = false
  ): StatusType {
    if (isLate && mfgStatus !== 'LIVREE' && mfgStatus !== 'TERMINEE') {
      return 'late';
    }
    switch (mfgStatus) {
      case 'BROUILLON':
        return 'new';
      case 'CONFIRMEE':
        return 'new';
      case 'EN_COURS':
        return 'progress';
      case 'PRETE':
        return 'ready';
      case 'A_LIVRER':
        return 'to_deliver';
      case 'LIVREE':
        return 'done';
      case 'TERMINEE':
        return 'done';
      default:
        return 'progress';
    }
  }

  /**
   * Automatically calculate Payment Status from financial amounts
   */
  static calculatePaymentStatus(priceFCFA: number, paidFCFA: number): PaymentStatus {
    const safePrice = Math.max(0, priceFCFA || 0);
    const safePaid = Math.max(0, paidFCFA || 0);

    if (safePaid <= 0) {
      return 'NON_PAYEE';
    }
    if (safePaid >= safePrice) {
      return 'PAYEE';
    }
    return 'PARTIELLEMENT_PAYEE';
  }

  /**
   * Automatically calculate Due Date Status from deliveryDate string and manufacturing status
   */
  static calculateDueDateStatus(
    deliveryDateStr: string,
    manufacturingStatus: ManufacturingStatus
  ): DueDateStatus {
    if (manufacturingStatus === 'LIVREE' || manufacturingStatus === 'TERMINEE') {
      return 'A_TEMPS';
    }

    const lower = (deliveryDateStr || '').toLowerCase();
    if (lower.includes('retard') || lower.includes('hier')) {
      return 'EN_RETARD';
    }
    if (lower.includes('demain')) {
      return 'BIENTOT';
    }
    if (lower.includes('aujourd')) {
      return 'AUJOURD_HUI';
    }

    // Try parsing date string if ISO or DD/MM/YYYY
    const parsedDate = Date.parse(deliveryDateStr);
    if (!isNaN(parsedDate)) {
      const now = new Date();
      const target = new Date(parsedDate);
      const diffDays = Math.ceil((target.getTime() - now.getTime()) / (1000 * 3600 * 24));

      if (diffDays < 0) return 'EN_RETARD';
      if (diffDays === 0) return 'AUJOURD_HUI';
      if (diffDays <= 2) return 'BIENTOT';
    }

    return 'A_TEMPS';
  }

  /**
   * Calculate business Priority (CRITIQUE | HAUTE | MOYENNE | NORMALE)
   */
  static calculatePriority(
    order: Partial<Order>,
    mfgStatus: ManufacturingStatus,
    _paymentStatus: PaymentStatus,
    dueDateStatus: DueDateStatus
  ): OrderPriority {
    const balance = order.balanceFCFA ?? ((order.priceFCFA || 0) - (order.paidFCFA || 0));

    if (dueDateStatus === 'EN_RETARD' && balance > 0) {
      return 'CRITIQUE';
    }
    if (dueDateStatus === 'EN_RETARD' || (dueDateStatus === 'AUJOURD_HUI' && balance > 0)) {
      return 'HAUTE';
    }
    if (dueDateStatus === 'AUJOURD_HUI' || mfgStatus === 'PRETE' || dueDateStatus === 'BIENTOT') {
      return 'MOYENNE';
    }
    return 'NORMALE';
  }

  /**
   * Guard transition between manufacturing statuses
   */
  static canTransitionTo(
    fromStatus: ManufacturingStatus,
    toStatus: ManufacturingStatus
  ): { allowed: boolean; reason?: string } {
    if (fromStatus === toStatus) return { allowed: true };

    const flow: ManufacturingStatus[] = [
      'BROUILLON',
      'CONFIRMEE',
      'EN_COURS',
      'PRETE',
      'A_LIVRER',
      'LIVREE',
      'TERMINEE',
    ];

    if (fromStatus === 'LIVREE' && toStatus === 'EN_COURS') {
      return {
        allowed: false,
        reason: 'Une commande déjà livrée ne peut pas revenir directement en cours de confection.',
      };
    }

    if (fromStatus === 'TERMINEE' && flow.indexOf(toStatus) < flow.indexOf('TERMINEE')) {
      return {
        allowed: false,
        reason: 'Une commande archivée et terminée ne peut plus changer de statut.',
      };
    }

    return { allowed: true };
  }

  /**
   * Determine data-driven Next Primary Action and Contextual Secondary Actions
   */
  static getNextActions(order: Order, clientPhone?: string): NextActionResult {
    const mfgStatus = order.manufacturingStatus || this.mapLegacyToManufacturingStatus(order.status);
    const dueDateStatus = order.dueDateStatus || this.calculateDueDateStatus(order.deliveryDate, mfgStatus);
    const hasPhone = Boolean(clientPhone && clientPhone.trim().length > 3);
    const balance = order.balanceFCFA ?? (order.priceFCFA - order.paidFCFA);
    const hasBalance = balance > 0;

    let primaryAction: ContextualAction | null = null;

    // Primary Action Determination
    switch (mfgStatus) {
      case 'BROUILLON':
        primaryAction = {
          id: 'act_confirm',
          label: 'Confirmer la commande',
          actionKey: 'CONFIRMER_COMMANDE',
          intent: 'primary',
          iconName: 'ClipboardCheck',
          description: 'Valider les détails et démarrer le suivi atelier',
        };
        break;
      case 'CONFIRMEE':
        primaryAction = {
          id: 'act_start',
          label: 'Démarrer la confection',
          actionKey: 'DEMARRER_CONFECTION',
          intent: 'primary',
          iconName: 'Scissors',
          description: 'Passer la commande en atelier de couture',
        };
        break;
      case 'EN_COURS':
        primaryAction = {
          id: 'act_ready',
          label: 'Marquer prête',
          actionKey: 'MARQUER_PRETE',
          intent: 'primary',
          iconName: 'CheckCircle2',
          description: 'La confection est terminée, vêtement prêt',
        };
        break;
      case 'PRETE':
        primaryAction = {
          id: 'act_notify',
          label: 'Prévenir le client',
          actionKey: 'PREVENIR_CLIENT',
          intent: 'info',
          iconName: 'MessageSquare',
          description: 'Envoyer un message WhatsApp / SMS au client',
        };
        break;
      case 'A_LIVRER':
        primaryAction = {
          id: 'act_deliver',
          label: 'Marquer livrée',
          actionKey: 'MARQUER_LIVREE',
          intent: 'success',
          iconName: 'Truck',
          description: 'Remettre l\'article au client',
        };
        break;
      case 'LIVREE':
      case 'TERMINEE':
        if (hasBalance) {
          primaryAction = {
            id: 'act_collect',
            label: 'Encaisser le solde',
            actionKey: 'ENCAISSER_SOLDE',
            intent: 'warning',
            iconName: 'DollarSign',
            description: `Enregistrer le reste à payer (${balance.toLocaleString('fr-FR')} FCFA)`,
          };
        } else if (mfgStatus === 'LIVREE') {
          primaryAction = {
            id: 'act_finish',
            label: 'Clôturer la commande',
            actionKey: 'TERMINER_COMMANDE',
            intent: 'success',
            iconName: 'PackageCheck',
            description: 'Archiver cette commande terminée avec succès',
          };
        }
        break;
    }

    // Contextual Overrides: Overdue order with balance prioritizing payment or contact
    if (dueDateStatus === 'EN_RETARD' && mfgStatus !== 'LIVREE' && mfgStatus !== 'TERMINEE') {
      if (hasPhone && mfgStatus === 'PRETE') {
        primaryAction = {
          id: 'act_relancer',
          label: 'Relancer le client (Retard)',
          actionKey: 'PREVENIR_CLIENT',
          intent: 'danger',
          iconName: 'AlertCircle',
          description: 'Commande en retard — contacter le client immédiatement',
        };
      }
    }

    // Data-driven Secondary Actions
    const secondaryActions: ContextualAction[] = [];

    if (hasBalance && primaryAction?.actionKey !== 'ENCAISSER_SOLDE') {
      secondaryActions.push({
        id: 'sec_pay',
        label: 'Encaisser un paiement',
        actionKey: 'ENCAISSER_SOLDE',
        intent: 'warning',
        iconName: 'DollarSign',
      });
    }

    if (mfgStatus === 'PRETE' && primaryAction?.actionKey !== 'MARQUER_A_LIVRER') {
      secondaryActions.push({
        id: 'sec_to_deliver',
        label: 'Passer à livrer',
        actionKey: 'MARQUER_A_LIVRER',
        intent: 'info',
        iconName: 'Truck',
      });
    }

    if (hasPhone) {
      secondaryActions.push({
        id: 'sec_call',
        label: 'Appeler le client',
        actionKey: 'APPELER_CLIENT',
        intent: 'secondary',
        iconName: 'Phone',
      });
      secondaryActions.push({
        id: 'sec_wa',
        label: 'Message WhatsApp',
        actionKey: 'WHATSAPP_CLIENT',
        intent: 'success',
        iconName: 'MessageSquare',
      });
    }

    secondaryActions.push({
      id: 'sec_measures',
      label: 'Voir les mensurations',
      actionKey: 'VOIR_MENSURATIONS',
      intent: 'secondary',
      iconName: 'Ruler',
    });

    secondaryActions.push({
      id: 'sec_client',
      label: 'Fiche client',
      actionKey: 'VOIR_CLIENT',
      intent: 'secondary',
      iconName: 'User',
    });

    if (mfgStatus !== 'LIVREE' && mfgStatus !== 'TERMINEE') {
      secondaryActions.push({
        id: 'sec_cancel',
        label: 'Annuler la commande',
        actionKey: 'ANNULER_COMMANDE',
        intent: 'danger',
        iconName: 'X',
      });
    }

    return {
      primaryAction,
      secondaryActions,
    };
  }
}
