import fs from 'fs/promises';
import handlebars from 'handlebars';
import path from 'path';
import { fileURLToPath } from 'url';
import { NOTIFICATION_CONFIG } from '../config/notification.config.js';

// Pour obtenir le __dirname équivalent en ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class TemplateService {
  constructor() {
    // Chemin vers le dossier 'templates' à la racine du backend
    this.templatesPath = path.resolve(__dirname, '..', 'templates');
    this.emailTemplatesPath = path.join(this.templatesPath, 'emails');
    this.compiledTemplates = new Map();
    this.registerHelpers();
    this.registerBaseTemplate();
  }

  /**
   * Enregistre le partial 'base.hbs'
   */
  async registerBaseTemplate() {
    try {
      const baseTemplatePath = path.join(this.emailTemplatesPath, 'base.hbs');
      await fs.access(baseTemplatePath); // Verify file exists
      const baseTemplateContent = await fs.readFile(baseTemplatePath, 'utf8');
      handlebars.registerPartial('base', baseTemplateContent);
      console.log('✅ Template de base (base.hbs) enregistré.');
    } catch (error) {
      console.error('❌ Erreur lors de l\'enregistrement du partial base.hbs:', error);
    }
  }

  /**
   * Enregistre les helpers Handlebars personnalisés
   */
  registerHelpers() {
    handlebars.registerHelper('formatDate', (date, format = 'DD/MM/YYYY') => {
      if (!date) return '';
      const d = new Date(date);
      return d.toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' });
    });

    handlebars.registerHelper('formatName', (firstName, lastName) => {
      return [firstName, lastName].filter(Boolean).join(' ') || 'Utilisateur';
    });

    handlebars.registerHelper('ifEquals', function (arg1, arg2, options) {
      return arg1 == arg2 ? options.fn(this) : options.inverse(this);
    });

    handlebars.registerHelper('capitalize', (str) => {
      if (!str) return '';
      return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    });

    handlebars.registerHelper('buildUrl', (path, context) => {
      const baseUrl = context.data.root.baseUrl || 'http://localhost:5173';
      return `${baseUrl}${path}`;
    });
  }

  /**
   * Rend un template d'email
   * @param {string} templateName - Nom du template (ex: 'defense-accepted')
   * @param {Object} data - Données pour le template
   */
  async renderEmailTemplate(templateName, data) {
    try {
      // Normalize template name (remove .hbs if present)
      const normalizedTemplateName = templateName.replace(/\.hbs$/, '');
      const compiledTemplate = await this.getCompiledTemplate(normalizedTemplateName);
      
      // Préparer les données pour le template
      const templateData = {
        ...data,
        config: {
          companyName: process.env.COMPANY_NAME || 'Votre Plateforme',
          supportEmail: process.env.SUPPORT_EMAIL || 'support@example.com',
        },
        baseUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
        logoUrl: process.env.LOGO_URL || '',
        currentYear: new Date().getFullYear(),
      };

      const html = compiledTemplate(templateData);
      const text = this.htmlToText(html);

      return { html, text };
    } catch (error) {
      console.error(`❌ Erreur lors du rendu du template ${templateName}:`, error);
      return this.getFallbackTemplate(templateName, data);
    }
  }

  /**
   * Récupère un template compilé (avec cache)
   * @param {string} templateName - Nom du template (sans .hbs)
   */
  async getCompiledTemplate(templateName) {
    const cacheKey = templateName.replace(/\.hbs$/, '');
    if (this.compiledTemplates.has(cacheKey)) {
      return this.compiledTemplates.get(cacheKey);
    }

    const template = await this.loadAndCompileTemplate(templateName);
    this.compiledTemplates.set(cacheKey, template);
    return template;
  }

  /**
   * Charge et compile un template depuis le système de fichiers
   * @param {string} templateName - Nom du template (sans .hbs)
   */
  async loadAndCompileTemplate(templateName) {
    try {
      // Ensure .hbs extension
      const templateFileName = templateName.endsWith('.hbs') ? templateName : `${templateName}.hbs`;
      const filePath = path.join(this.emailTemplatesPath, templateFileName);
      
      console.log(`📂 Attempting to load template at: ${filePath}`);
      await fs.access(filePath); // Verify file exists
      const fileContent = await fs.readFile(filePath, 'utf-8');
      const compiledTemplate = handlebars.compile(fileContent);
      return compiledTemplate;
    } catch (error) {
      if (error.code === 'ENOENT') {
        console.warn(`⚠️ Template ${templateName} not found at ${path.join(this.emailTemplatesPath, templateName)}.hbs, falling back to default`);
        const defaultTemplatePath = path.join(this.emailTemplatesPath, 'default.hbs');
        console.log(`📂 Attempting to load default template at: ${defaultTemplatePath}`);
        await fs.access(defaultTemplatePath);
        const defaultContent = await fs.readFile(defaultTemplatePath, 'utf-8');
        return handlebars.compile(defaultContent);
      }
      throw new Error(`Failed to load template ${templateName}: ${error.message}`);
    }
  }

  /**
   * Génère un template de fallback en cas d'erreur
   * @param {string} templateName - Nom du template
   * @param {Object} data - Données pour le template
   */
  getFallbackTemplate(templateName, data) {
    // Normalize template name for config lookup
    const eventTypeKey = templateName.replace(/\.hbs$/, '');
    const subject = NOTIFICATION_CONFIG.EMAIL_TEMPLATES[eventTypeKey]?.subject || 'Notification';
    const message = NOTIFICATION_CONFIG.DEFAULT_MESSAGES[eventTypeKey] || 'Vous avez une nouvelle notification.';

    let recipientName = 'Cher utilisateur';
    if (data.recipient?.name) {
      recipientName = data.recipient.name;
    } else if (data.student?.firstName) {
      recipientName = `${data.student.firstName} ${data.student.lastName || ''}`.trim();
    }

    const companyName = process.env.COMPANY_NAME || 'Votre Plateforme';
    const supportEmail = process.env.SUPPORT_EMAIL || 'support@example.com';

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>${subject}</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #f8f9fa; padding: 20px; text-align: center; }
          .content { padding: 20px; }
          .footer { background-color: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${companyName}</h1>
          </div>
          <div class="content">
            <h2>Bonjour ${recipientName},</h2>
            <p>${message}</p>
            <p>Connectez-vous à votre compte pour plus de détails.</p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} ${companyName}. Tous droits réservés.</p>
            <p>Pour toute question, contactez-nous à ${supportEmail}</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
      ${companyName}
      
      Bonjour ${recipientName},
      
      ${message}
      
      Connectez-vous à votre compte pour plus de détails.
      
      ---
      ${companyName}
      ${supportEmail}
    `;

    return { html, text };
  }

  /**
   * Convertit du HTML en texte brut
   * @param {string} html - Contenu HTML
   */
  htmlToText(html) {
    return html
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Crée les templates par défaut s'ils n'existent pas
   */
  async createDefaultTemplates() {
    try {
      await fs.mkdir(this.emailTemplatesPath, { recursive: true });

      const templatesToCreate = Object.keys(NOTIFICATION_CONFIG.EMAIL_TEMPLATES);

      for (const templateKey of templatesToCreate) {
        const templateFileName = `${NOTIFICATION_CONFIG.EMAIL_TEMPLATES[templateKey].template}.hbs`;
        await this.createTemplateIfNotExists(templateFileName, templateKey);
      }

      console.log('✅ Templates par défaut créés');
    } catch (error) {
      console.error('❌ Erreur lors de la création des templates par défaut:', error);
    }
  }

  /**
   * Crée un template s'il n'existe pas
   * @param {string} templateFileName - Nom du fichier template (ex: 'defense-accepted.hbs')
   * @param {string} eventTypeKey - Clé de l'événement (ex: 'defense:accepted')
   */
  async createTemplateIfNotExists(templateFileName, eventTypeKey) {
    const filePath = path.join(this.emailTemplatesPath, templateFileName);
    
    try {
      await fs.access(filePath);
      console.log(`ℹ️ Template ${templateFileName} already exists`);
    } catch {
      const htmlContent = this.generateDefaultHtmlTemplate(eventTypeKey);
      await fs.writeFile(filePath, htmlContent);
      console.log(`✅ Template créé: ${templateFileName}`);
    }
  }

  /**
   * Génère un template HTML par défaut
   * @param {string} eventTypeKey - Clé de l'événement (ex: 'defense:accepted')
   */
  generateDefaultHtmlTemplate(eventTypeKey) {
    const config = NOTIFICATION_CONFIG.EMAIL_TEMPLATES[eventTypeKey];
    const message = NOTIFICATION_CONFIG.DEFAULT_MESSAGES[eventTypeKey] || 'Vous avez une nouvelle notification.';

    return `{{> base 
  subject="${config?.subject || 'Notification'}"
  content="
    <p>${message}</p>
    {{#if eventData.subject}}
    <p><strong>Sujet :</strong> {{eventData.subject.title}}</p>
    {{/if}}
    {{#if eventData.date}}
    <p><strong>Date :</strong> {{formatDate eventData.date}}</p>
    {{/if}}
    {{#if eventData.status}}
    <p><strong>Statut :</strong> {{capitalize eventData.status}}</p>
    {{/if}}
    {{#if eventData.professor}}
    <p><strong>Professeur :</strong> {{formatName eventData.professor.firstName eventData.professor.lastName}}</p>
    {{/if}}
  "
  actionUrl=(buildUrl "/dashboard")
  actionText="Voir les détails"
  priority="{{priority}}"
  priorityLabel="{{priorityLabel}}"
}}`;
  }

  /**
   * Vide le cache des templates
   */
  clearCache() {
    this.compiledTemplates.clear();
    console.log('✅ Cache des templates vidé');
  }

  /**
   * Recharge un template spécifique
   * @param {string} templateName - Nom du template
   */
  async reloadTemplate(templateName) {
    const cacheKey = templateName.replace(/\.hbs$/, '');
    this.compiledTemplates.delete(cacheKey);
    await this.getCompiledTemplate(cacheKey);
    console.log(`✅ Template rechargé: ${templateName}`);
  }
}

export default TemplateService;