/**
 * Controlador para manejo de emails y notificaciones
 */
const nodemailer = require('nodemailer');
require('dotenv').config();

// Configurar el transporter de nodemailer
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'floristerialaurita@gmail.com',
    pass: process.env.EMAIL_PASS || 'clave_app_segura'
  }
});

/**
 * Envía un correo electrónico de confirmación al cliente
 * y notifica al personal de la floristería sobre el nuevo mensaje
 */
exports.sendContactConfirmation = async (req, res) => {
  const { name, email, phone, subject, message } = req.body;

  if (!name || !email || !subject || !message) {
    return res.status(400).json({ 
      success: false, 
      message: 'Faltan campos requeridos' 
    });
  }

  try {
    // 1. Correo de confirmación para el cliente
    const clientMailOptions = {
      from: `"Floristería Laurita" <${process.env.EMAIL_USER || 'floristerialaurita@gmail.com'}>`,
      to: email,
      subject: 'Confirmación de mensaje - Floristería Laurita',
      html: `
        <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e8e8e8; border-radius: 5px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <img src="https://i.imgur.com/EkBDU8p.png" alt="Floristería Laurita Logo" style="max-width: 150px;">
            <h2 style="color: #4caf50; margin: 10px 0;">¡Gracias por contactarnos!</h2>
          </div>
          
          <div style="padding: 20px; background-color: #f9f9f9; border-radius: 4px; margin-bottom: 20px;">
            <p>Hola <strong>${name}</strong>,</p>
            <p>Hemos recibido tu mensaje correctamente. Este es un correo automático de confirmación.</p>
            <p>Un miembro de nuestro equipo especializado revisará tu consulta y te responderá a la brevedad.</p>
            
            <div style="margin: 20px 0; padding: 15px; background-color: #f0f7f0; border-left: 4px solid #4caf50; border-radius: 3px;">
              <p style="margin: 0;"><strong>Asunto:</strong> ${subject}</p>
              <p style="margin: 8px 0 0;"><strong>Mensaje:</strong> ${message}</p>
            </div>
            
            <p>Si necesitas ayuda inmediata, no dudes en llamarnos al +57 (604) 301-5555 o responder a este correo.</p>
          </div>
          
          <div style="text-align: center; padding-top: 20px; border-top: 1px solid #e8e8e8; color: #777;">
            <p>Floristería Laurita | Calle 65 Sur #45-25, Sabaneta, Antioquia</p>
            <p>
              <a href="https://www.facebook.com/p/Floristeria-laurita-100028843076348/?locale=es_LA" style="color: #3b5998; text-decoration: none; margin: 0 5px;">Facebook</a> | 
              <a href="https://www.instagram.com/floristeriayviverolaurita/" style="color: #e1306c; text-decoration: none; margin: 0 5px;">Instagram</a> | 
              <a href="https://wa.me/573016324030" style="color: #25d366; text-decoration: none; margin: 0 5px;">WhatsApp</a>
            </p>
          </div>
        </div>
      `
    };

    // 2. Notificación para el personal de la floristería
    const staffMailOptions = {
      from: `"Sistema de Contacto" <${process.env.EMAIL_USER || 'floristerialaurita@gmail.com'}>`,
      to: process.env.ADMIN_EMAIL || 'info@floristerialaurita.com',
      subject: `Nuevo mensaje de contacto: ${subject}`,
      html: `
        <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; padding: 20px; border: 1px solid #e8e8e8; border-radius: 5px;">
          <h2 style="color: #4caf50;">Nuevo mensaje de contacto</h2>
          
          <div style="margin: 20px 0; padding: 15px; background-color: #f9f9f9; border-radius: 4px;">
            <p><strong>Nombre:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            ${phone ? `<p><strong>Teléfono:</strong> ${phone}</p>` : ''}
            <p><strong>Asunto:</strong> ${subject}</p>
            <p><strong>Mensaje:</strong> ${message}</p>
            <p><strong>Fecha:</strong> ${new Date().toLocaleString('es-CO')}</p>
          </div>
          
          <p>Para responder directamente, puedes usar el botón a continuación o responder a este correo.</p>
          
          <div style="text-align: center; margin-top: 20px;">
            <a href="mailto:${email}" style="background-color: #4caf50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; display: inline-block;">Responder al Cliente</a>
          </div>
        </div>
      `
    };

    // Enviar los correos
    await Promise.all([
      transporter.sendMail(clientMailOptions),
      transporter.sendMail(staffMailOptions)
    ]);

    return res.status(200).json({
      success: true,
      message: 'Mensaje enviado correctamente. Se ha enviado una confirmación al correo proporcionado.'
    });
    
  } catch (error) {
    console.error('Error al enviar el correo:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Error al enviar el correo electrónico',
      error: error.message 
    });
  }
};
