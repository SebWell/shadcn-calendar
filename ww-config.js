export default {
    editor: {
        label: {
            en: 'Calendar',
            fr: 'Calendrier'
        },
        icon: 'calendar_month',
    },
    triggerEvents: [
        { name: 'trigger-event', label: { en: 'On date select', fr: 'Sur sélection de date' }, event: { domEvent: '', value: '' }, default: true },
    ],
    properties: {
        content: {
            label: {
                en: 'Calendar content',
                fr: 'Contenu calendrier'
            },
            type: 'Object',
            section: 'content',
            bindable: true,
            defaultValue: {
                mode: 'single',
                selectedDate: null,
                showHeader: true,
                showFooter: true,
                showToday: true,
                showClear: true,
                minDate: null,
                maxDate: null,
                disabledDates: [],
                events: [],
                locale: 'en'
            },
            options: {
                item: {
                    mode: {
                        label: {
                            en: 'Selection mode',
                            fr: 'Mode de sélection'
                        },
                        type: 'TextSelect',
                        options: {
                            options: [
                                { value: 'single', label: 'Single' },
                                { value: 'multiple', label: 'Multiple' },
                                { value: 'range', label: 'Range' }
                            ]
                        },
                        section: 'content'
                    },
                    selectedDate: {
                        label: {
                            en: 'Selected date',
                            fr: 'Date sélectionnée'
                        },
                        type: 'Text',
                        section: 'content',
                        bindable: true
                    },
                    showHeader: {
                        label: {
                            en: 'Show header',
                            fr: 'Afficher en-tête'
                        },
                        type: 'OnOff',
                        section: 'style',
                        bindable: true
                    },
                    showFooter: {
                        label: {
                            en: 'Show footer',
                            fr: 'Afficher pied de page'
                        },
                        type: 'OnOff',
                        section: 'style',
                        bindable: true
                    },
                    showToday: {
                        label: {
                            en: 'Show today button',
                            fr: 'Bouton aujourd\'hui'
                        },
                        type: 'OnOff',
                        section: 'style',
                        bindable: true
                    },
                    showClear: {
                        label: {
                            en: 'Show clear button',
                            fr: 'Bouton effacer'
                        },
                        type: 'OnOff',
                        section: 'style',
                        bindable: true
                    },
                    minDate: {
                        label: {
                            en: 'Minimum date',
                            fr: 'Date minimum'
                        },
                        type: 'Text',
                        section: 'settings',
                        bindable: true
                    },
                    maxDate: {
                        label: {
                            en: 'Maximum date',
                            fr: 'Date maximum'
                        },
                        type: 'Text',
                        section: 'settings',
                        bindable: true
                    }
                }
            }
        }
    }
};