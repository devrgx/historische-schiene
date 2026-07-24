export const dunningConfig = {
  /**
   * Nach Ablauf der Rechnungsfälligkeit wartet das System
   * zunächst diese Anzahl an Kalendertagen.
   */
  gracePeriodDays: 5,

  /**
   * Zahlungsfrist einer neu ausgestellten Erinnerung
   * oder Mahnung.
   */
  paymentTermDays: 10,

  /**
   * Gebühren werden vorerst nicht automatisch erhoben.
   *
   * Die Werte können später durch einen Beschluss oder eine
   * rechtliche Prüfung angepasst werden.
   */
  levels: {
    PAYMENT_REMINDER: {
      label: "Zahlungserinnerung",

      /**
       * Tage nach Ablauf der ursprünglichen Rechnung
       * einschließlich Kulanzfrist.
       */
      daysAfterDueDate: 5,

      feeCents: 0,

      subject:
        "Zahlungserinnerung zu Ihrer Beitragsrechnung",

      introduction:
        "Bei der Prüfung unserer Zahlungseingänge konnten wir für die nachfolgende Rechnung noch keinen vollständigen Zahlungseingang feststellen.",

      closing:
        "Sollten Sie den Betrag zwischenzeitlich bezahlt haben, betrachten Sie dieses Schreiben bitte als gegenstandslos.",
    },

    FIRST_REMINDER: {
      label: "Erste Mahnung",

      /**
       * Die erste Mahnung wird frühestens 15 Tage nach
       * Fälligkeit vorgeschlagen.
       */
      daysAfterDueDate: 15,

      feeCents: 0,

      subject:
        "Erste Mahnung zu Ihrer Beitragsrechnung",

      introduction:
        "Trotz unserer vorherigen Zahlungserinnerung ist der offene Rechnungsbetrag bislang nicht vollständig eingegangen.",

      closing:
        "Bitte begleichen Sie den offenen Betrag innerhalb der angegebenen Zahlungsfrist.",
    },

    FINAL_REMINDER: {
      label: "Letzte Mahnung",

      /**
       * Die letzte Mahnung wird frühestens 30 Tage nach
       * Fälligkeit vorgeschlagen.
       */
      daysAfterDueDate: 30,

      feeCents: 0,

      subject:
        "Letzte Mahnung zu Ihrer Beitragsrechnung",

      introduction:
        "Der offene Rechnungsbetrag wurde trotz vorheriger Erinnerung und Mahnung bislang nicht vollständig beglichen.",

      closing:
        "Bitte setzen Sie sich bei Rückfragen oder Zahlungsschwierigkeiten zeitnah mit dem Vorstand in Verbindung.",
    },
  },

  /**
   * Keine automatische Berechnung von Verzugszinsen.
   */
  automaticallyApplyInterest: false,

  /**
   * Keine automatische Ausstellung oder Versendung.
   *
   * Der tägliche Job erzeugt ausschließlich Entwürfe.
   */
  automaticallyIssueReminders: false,
  automaticallySendReminders: false,
} as const;

export type ConfiguredReminderLevel =
  keyof typeof dunningConfig.levels;

export function getReminderConfiguration(
  level: ConfiguredReminderLevel,
) {
  return dunningConfig.levels[level];
}

export function getReminderDueDate(
  issueDate: Date,
): Date {
  assertValidDate(issueDate);

  const dueDate =
    new Date(issueDate);

  dueDate.setUTCDate(
    dueDate.getUTCDate() +
      dunningConfig.paymentTermDays,
  );

  return dueDate;
}

export function getReminderEligibilityDate(
  invoiceDueDate: Date,
  level: ConfiguredReminderLevel,
): Date {
  assertValidDate(invoiceDueDate);

  const configuration =
    getReminderConfiguration(level);

  const eligibilityDate =
    new Date(invoiceDueDate);

  eligibilityDate.setUTCDate(
    eligibilityDate.getUTCDate() +
      configuration.daysAfterDueDate,
  );

  return eligibilityDate;
}

function assertValidDate(
  date: Date,
): void {
  if (
    !(date instanceof Date) ||
    Number.isNaN(date.getTime())
  ) {
    throw new Error(
      "Es wurde kein gültiges Datum übergeben.",
    );
  }
}