export default {
  editor: {
    label: {
      en: 'Calendar',
      fr: 'Calendrier'
    },
    icon: 'calendar'
  },
  triggerEvents: [
    {
      name: 'select',
      label: { en: 'On date select', fr: 'À la sélection de date' },
      event: {
        date: null,
        selectedDates: [],
        mode: 'single'
      }
    },
    {
      name: 'month-change',
      label: { en: 'On month change', fr: 'Au changement de mois' },
      event: {
        month: 0,
        year: 2024,
        monthName: 'January'
      }
    },
    {
      name: 'update:modelValue',
      label: { en: 'On value update', fr: 'Mise à jour de la valeur' },
      event: {
        value: null
      }
    }
  ],
  properties: {
    mode: {
      label: { en: 'Selection mode', fr: 'Mode de sélection' },
      type: 'TextSelect',
      options: {
        options: [
          { value: 'single', label: { en: 'Single', fr: 'Simple' } },
          { value: 'multiple', label: { en: 'Multiple', fr: 'Multiple' } },
          { value: 'range', label: { en: 'Range', fr: 'Plage' } }
        ]
      },
      defaultValue: 'single',
      bindable: true
    },
    minDate: {
      label: { en: 'Minimum date', fr: 'Date minimum' },
      type: 'Text',
      bindable: true
    },
    maxDate: {
      label: { en: 'Maximum date', fr: 'Date maximum' },
      type: 'Text',
      bindable: true
    },
    disabledDates: {
      label: { en: 'Disabled dates', fr: 'Dates désactivées' },
      type: 'Array',
      options: {
        item: {
          type: 'Text'
        }
      },
      bindable: true
    },
    events: {
      label: { en: 'Events', fr: 'Événements' },
      type: 'Array',
      options: {
        item: {
          type: 'Object',
          options: {
            item: {
              date: {
                label: { en: 'Date', fr: 'Date' },
                type: 'Text',
                bindable: true
              },
              title: {
                label: { en: 'Title', fr: 'Titre' },
                type: 'Text',
                bindable: true
              },
              description: {
                label: { en: 'Description', fr: 'Description' },
                type: 'Text',
                bindable: true
              }
            }
          }
        }
      },
      bindable: true
    },
    showSelectedInfo: {
      label: { en: 'Show selected info', fr: 'Afficher les infos de sélection' },
      type: 'OnOff',
      defaultValue: true,
      bindable: true
    },
    showFooter: {
      label: { en: 'Show footer', fr: 'Afficher le pied de page' },
      type: 'OnOff',
      defaultValue: true,
      bindable: true
    },
    showClear: {
      label: { en: 'Show clear button', fr: 'Afficher le bouton effacer' },
      type: 'OnOff',
      defaultValue: true,
      bindable: true
    },
    showToday: {
      label: { en: 'Show today button', fr: 'Afficher le bouton aujourd\'hui' },
      type: 'OnOff',
      defaultValue: true,
      bindable: true
    },
    customClass: {
      label: { en: 'Custom CSS class', fr: 'Classe CSS personnalisée' },
      type: 'Text',
      bindable: true
    },
    customStyle: {
      label: { en: 'Custom style', fr: 'Style personnalisé' },
      type: 'Text',
      bindable: true
    }
  }
} 