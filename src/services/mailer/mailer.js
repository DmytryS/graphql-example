import nodemailer from 'nodemailer';
import handlebars from 'handlebars';
import layouts from 'handlebars-layouts';
import { promisifyAll, promisify } from 'bluebird';
import path from 'path';
import fs from 'fs';
import log4js from 'log4js';
import configuration from '../../../config';

const readFile = promisify(fs.readFile);

handlebars.registerHelper(layouts(handlebars));
handlebars.registerPartial(
  'layout',
  fs.readFileSync(path.join(__dirname, '../../templates', 'layout.hbs'), 'utf8')
);

/**
 * Email sender class
 */
export class Mailer {
  /**
   * Constructs email sender
   * @param {Object} config config
   */
  constructor(config) {
    this.config = config;
    this.logger = log4js.getLogger('MailSender');

    if (process.env.NODE_ENV === 'test') {
      this.tranport = {
        sendMailAsync: Promise.resolve()
      };
    } else {
      this.tranport = promisifyAll(
        nodemailer.createTransport(this.config.MAIL.transport_options)
      );
    }
  }

  /**
   * Sends email to user
   * @param {String} email destination email
   * @param {String} templateName template name
   * @param {Object} templateData template data to send
   * @returns {Promise} Returns promise which will be resolved mail sent
   */
  async send(email, templateName, templateData) {
    try {
      // eslint-disable-next-line
      templateData = {
        ...templateData,
        uiUrl: this.config.SERVER.uiUrl
      };

      const template = await this.getTemplate(templateName, templateData);
      const mailOptions = {
        from: this.config.MAIL.from,
        to: email,
        subject: template.subject,
        html: template.body
      };

      const response = await this.tranport.sendMailAsync(mailOptions);

      this.logger.info(`Email was successfully sent to ${email}`);
      return response.message;
    } catch (err) {
      this.logger.error(`Email send was rejected by error: ${err}`);
      throw err;
    }
  }

  async getTemplate(templateName, templateData) {
    try {
      const bodyTemplate = await readFile(
        path.join(__dirname, '../../templates', templateName, 'html.hbs')
      );
      const subjectTemplate = await readFile(
        path.join(__dirname, '../../templates', templateName, 'subject.hbs')
      );

      return {
        body: handlebars.compile(bodyTemplate.toString())({ ...templateData }),
        subject: handlebars.compile(subjectTemplate.toString())({
          ...templateData
        })
      };
    } catch (err) {
      this.logger.error('An error occured during mail send', err);
      throw new Error('An error occured during mail send');
    }
  }
}

export default new Mailer(configuration);
