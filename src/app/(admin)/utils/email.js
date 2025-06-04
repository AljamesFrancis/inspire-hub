import emailjs from '@emailjs/browser';

export const sendAcceptanceEmail = async (clientData) => {
  try {
    const templateParams = {
      to_email: clientData.email,
      to_name: clientData.name,
      company: clientData.company,
      date: clientData.date?.seconds 
        ? new Date(clientData.date.seconds * 1000).toLocaleString()
        : new Date(clientData.date).toLocaleString(),
      reserved_seats: clientData.reservedSeats?.join(', ') || 'Not specified',
    };

    await emailjs.send(
      process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID,
      process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID,
      templateParams,
      process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY
    );
    
    return { success: true };
  } catch (error) {
    console.error('Failed to send email:', error);
    return { success: false, error };
  }
};



export const sendRejectionEmail = async (clientData) => {
  try {
    const templateParams = {
      to_email: clientData.email,
      to_name: clientData.name,
      company: clientData.company,
    };

    await emailjs.send(
      process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID,
      process.env.NEXT_PUBLIC_EMAILJS_REJECTION_TEMPLATE_ID, 
      templateParams,
      process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY
    );
    
    return { success: true };
  } catch (error) {
    console.error('Failed to send rejection email:', error);
    return { success: false, error };
  }
};




// Dummy function replace it with original
export const sendSubscriptionExpiryNotification = async (client) => {
  try {
    const templateParams = {
      to_email: client.email,
      to_name: client.name,
      company: client.company,
    };

    await emailjs.send(
      process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID,
      process.env.NEXT_PUBLIC_EMAILJS_REJECTION_TEMPLATE_ID, 
      templateParams,
      process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY
    );
    
    return { success: true };
  } catch (error) {
    console.error('Failed to send rejection email:', error);
    return { success: false, error };
  }
};

