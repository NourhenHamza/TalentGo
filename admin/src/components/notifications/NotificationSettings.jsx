import {
  Bell,
  Check,
  ChevronDown,
  ChevronRight,
  Filter,
  Mail,
  Save,
  Settings,
  Volume2,
  X
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { notificationAPI } from '../../services/notification.api.jsx';

/**
 * Composant pour gérer les paramètres de notifications
 */
const NotificationSettings = ({ className = '' }) => {
  const [settings, setSettings] = useState(null);
  const [eventTypes, setEventTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [expandedSections, setExpandedSections] = useState({
    global: true,
    events: false,
    channels: false,
    filters: false
  });

  // Charger les paramètres et types d'événements
  useEffect(() => {
    loadSettings();
    loadEventTypes();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await notificationAPI.getNotificationSettings();
      if (response.success) {
        setSettings(response.data);
      }
    } catch (err) {
      setError('Erreur lors du chargement des paramètres');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadEventTypes = async () => {
    try {
      const response = await notificationAPI.getEventTypes();
      if (response.success) {
        setEventTypes(response.data);
      }
    } catch (err) {
      console.error('Erreur lors du chargement des types d\'événements:', err);
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    setError(null);
    
    try {
      const response = await notificationAPI.updateNotificationSettings(settings);
      if (response.success) {
        setSuccessMessage('Paramètres sauvegardés avec succès');
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (err) {
      setError('Erreur lors de la sauvegarde des paramètres');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const updateGlobalSettings = (key, value) => {
    setSettings(prev => ({
      ...prev,
      globalSettings: {
        ...prev.globalSettings,
        [key]: value
      }
    }));
  };

  const updateQuietHours = (key, value) => {
    setSettings(prev => ({
      ...prev,
      globalSettings: {
        ...prev.globalSettings,
        quietHours: {
          ...prev.globalSettings.quietHours,
          [key]: value
        }
      }
    }));
  };

  const updateChannelSettings = (channel, key, value) => {
    setSettings(prev => ({
      ...prev,
      channels: {
        ...prev.channels,
        [channel]: {
          ...prev.channels[channel],
          [key]: value
        }
      }
    }));
  };

  const updateEventSettings = (eventType, key, value) => {
    setSettings(prev => {
      const existingEventSettings = prev.eventSettings || [];
      const existingIndex = existingEventSettings.findIndex(es => es.eventType === eventType);
      
      let newEventSettings;
      if (existingIndex !== -1) {
        // Mettre à jour les paramètres existants
        newEventSettings = [...existingEventSettings];
        newEventSettings[existingIndex] = {
          ...newEventSettings[existingIndex],
          [key]: value
        };
      } else {
        // Ajouter de nouveaux paramètres
        newEventSettings = [...existingEventSettings, {
          eventType,
          inAppEnabled: true,
          emailEnabled: true,
          minPriority: 'low',
          delay: 0,
          groupSimilar: true,
          groupPeriod: 60,
          [key]: value
        }];
      }
      
      return {
        ...prev,
        eventSettings: newEventSettings
      };
    });
  };

  const getEventSettings = (eventType) => {
    const eventSetting = settings?.eventSettings?.find(es => es.eventType === eventType);
    return eventSetting || {
      eventType,
      inAppEnabled: true,
      emailEnabled: true,
      minPriority: 'low',
      delay: 0,
      groupSimilar: true,
      groupPeriod: 60
    };
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-8 ${className}`}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-center text-gray-500">Chargement des paramètres...</p>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-8 ${className}`}>
        <p className="text-center text-red-500">Erreur lors du chargement des paramètres</p>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
      {/* En-tête */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              <Settings className="w-6 h-6 mr-2" />
              Paramètres de notifications
            </h2>
            <p className="text-gray-600 mt-1">
              Configurez vos préférences de notifications et d'emails
            </p>
          </div>
          
          <button
            onClick={saveSettings}
            disabled={saving}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center"
          >
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Sauvegarde...' : 'Sauvegarder'}
          </button>
        </div>

        {/* Messages de statut */}
        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center">
            <X className="w-5 h-5 text-red-500 mr-2" />
            <span className="text-red-700">{error}</span>
          </div>
        )}

        {successMessage && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center">
            <Check className="w-5 h-5 text-green-500 mr-2" />
            <span className="text-green-700">{successMessage}</span>
          </div>
        )}
      </div>

      <div className="p-6 space-y-6">
        {/* Paramètres globaux */}
        <SettingsSection
          title="Paramètres généraux"
          icon={Bell}
          expanded={expandedSections.global}
          onToggle={() => toggleSection('global')}
        >
          <div className="space-y-4">
            {/* Activation globale */}
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Notifications activées
                </label>
                <p className="text-xs text-gray-500">
                  Activer ou désactiver toutes les notifications
                </p>
              </div>
              <ToggleSwitch
                checked={settings.globalSettings.enabled}
                onChange={(value) => updateGlobalSettings('enabled', value)}
              />
            </div>

            {/* Emails activés */}
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Emails activés
                </label>
                <p className="text-xs text-gray-500">
                  Recevoir des notifications par email
                </p>
              </div>
              <ToggleSwitch
                checked={settings.globalSettings.emailEnabled}
                onChange={(value) => updateGlobalSettings('emailEnabled', value)}
              />
            </div>

            {/* Fréquence de digest */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fréquence des emails
              </label>
              <select
                value={settings.globalSettings.digestFrequency}
                onChange={(e) => updateGlobalSettings('digestFrequency', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="immediate">Immédiat</option>
                <option value="hourly">Toutes les heures</option>
                <option value="daily">Quotidien</option>
                <option value="weekly">Hebdomadaire</option>
                <option value="never">Jamais</option>
              </select>
            </div>

            {/* Heures de silence */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-700">
                  Heures de silence
                </label>
                <ToggleSwitch
                  checked={settings.globalSettings.quietHours.enabled}
                  onChange={(value) => updateQuietHours('enabled', value)}
                />
              </div>
              
              {settings.globalSettings.quietHours.enabled && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Début</label>
                    <input
                      type="time"
                      value={settings.globalSettings.quietHours.start}
                      onChange={(e) => updateQuietHours('start', e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Fin</label>
                    <input
                      type="time"
                      value={settings.globalSettings.quietHours.end}
                      onChange={(e) => updateQuietHours('end', e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </SettingsSection>

        {/* Paramètres par événement */}
        <SettingsSection
          title="Paramètres par type d'événement"
          icon={Filter}
          expanded={expandedSections.events}
          onToggle={() => toggleSection('events')}
        >
          <div className="space-y-4">
            {eventTypes.map((eventType) => {
              const eventSettings = getEventSettings(eventType.eventType);
              
              return (
                <div key={eventType.eventType} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">
                        {eventType.template?.subject || eventType.eventType}
                      </h4>
                      <p className="text-xs text-gray-500">
                        {eventType.defaultMessage}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {/* Notification in-app */}
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-600">In-app</span>
                      <ToggleSwitch
                        checked={eventSettings.inAppEnabled}
                        onChange={(value) => updateEventSettings(eventType.eventType, 'inAppEnabled', value)}
                        size="sm"
                      />
                    </div>

                    {/* Email */}
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-600">Email</span>
                      <ToggleSwitch
                        checked={eventSettings.emailEnabled}
                        onChange={(value) => updateEventSettings(eventType.eventType, 'emailEnabled', value)}
                        size="sm"
                      />
                    </div>

                    {/* Priorité minimale */}
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Priorité min.</label>
                      <select
                        value={eventSettings.minPriority}
                        onChange={(e) => updateEventSettings(eventType.eventType, 'minPriority', e.target.value)}
                        className="w-full text-xs border border-gray-300 rounded px-2 py-1 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="low">Faible</option>
                        <option value="medium">Moyenne</option>
                        <option value="high">Élevée</option>
                        <option value="urgent">Urgente</option>
                      </select>
                    </div>

                    {/* Délai */}
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Délai (min)</label>
                      <input
                        type="number"
                        min="0"
                        max="1440"
                        value={eventSettings.delay}
                        onChange={(e) => updateEventSettings(eventType.eventType, 'delay', parseInt(e.target.value))}
                        className="w-full text-xs border border-gray-300 rounded px-2 py-1 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </SettingsSection>

        {/* Paramètres de canaux */}
        <SettingsSection
          title="Canaux de notification"
          icon={Mail}
          expanded={expandedSections.channels}
          onToggle={() => toggleSection('channels')}
        >
          <div className="space-y-4">
            {/* Email */}
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-medium text-gray-900 flex items-center">
                  <Mail className="w-4 h-4 mr-2" />
                  Email
                </h4>
                <ToggleSwitch
                  checked={settings.channels.email.enabled}
                  onChange={(value) => updateChannelSettings('email', 'enabled', value)}
                />
              </div>
              
              {settings.channels.email.enabled && (
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Adresse email</label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="email"
                      value={settings.channels.email.address || ''}
                      onChange={(e) => updateChannelSettings('email', 'address', e.target.value)}
                      className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="votre@email.com"
                    />
                    {settings.channels.email.verified ? (
                      <span className="text-green-600 text-xs flex items-center">
                        <Check className="w-3 h-3 mr-1" />
                        Vérifié
                      </span>
                    ) : (
                      <span className="text-orange-600 text-xs">Non vérifié</span>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* SMS (futur) */}
            <div className="border border-gray-200 rounded-lg p-4 opacity-50">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-medium text-gray-900 flex items-center">
                  <Volume2 className="w-4 h-4 mr-2" />
                  SMS (bientôt disponible)
                </h4>
                <ToggleSwitch
                  checked={false}
                  onChange={() => {}}
                  disabled={true}
                />
              </div>
            </div>
          </div>
        </SettingsSection>
      </div>
    </div>
  );
};

/**
 * Composant section de paramètres pliable
 */
const SettingsSection = ({ title, icon: Icon, expanded, onToggle, children }) => {
  return (
    <div className="border border-gray-200 rounded-lg">
      <button
        onClick={onToggle}
        className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center">
          <Icon className="w-5 h-5 text-gray-500 mr-3" />
          <h3 className="text-lg font-medium text-gray-900">{title}</h3>
        </div>
        {expanded ? (
          <ChevronDown className="w-5 h-5 text-gray-500" />
        ) : (
          <ChevronRight className="w-5 h-5 text-gray-500" />
        )}
      </button>
      
      {expanded && (
        <div className="p-4 border-t border-gray-200">
          {children}
        </div>
      )}
    </div>
  );
};

/**
 * Composant toggle switch
 */
const ToggleSwitch = ({ checked, onChange, disabled = false, size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-8 h-4',
    md: 'w-10 h-5'
  };
  
  const thumbSizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4'
  };

  return (
    <button
      type="button"
      onClick={() => !disabled && onChange(!checked)}
      disabled={disabled}
      className={`
        relative inline-flex items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
        ${sizeClasses[size]}
        ${checked ? 'bg-blue-600' : 'bg-gray-300'}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
      `}
    >
      <span
        className={`
          inline-block rounded-full bg-white shadow transform transition-transform
          ${thumbSizeClasses[size]}
          ${checked ? (size === 'sm' ? 'translate-x-4' : 'translate-x-5') : 'translate-x-0.5'}
        `}
      />
    </button>
  );
};

export default NotificationSettings;

