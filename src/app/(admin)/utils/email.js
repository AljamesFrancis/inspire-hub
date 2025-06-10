import emailjs from '@emailjs/browser';

export const sendAcceptanceEmail = async (clientData) => {
  try {
    let seatInfo = clientData.reservedSeats?.join(', ') || 'Not specified';
    if (clientData.area) {
      seatInfo += ` (Office: ${clientData.area})`;
    }

    const templateParams = {
      to_email: clientData.email,
      to_name: clientData.name,
      company: clientData.company,
      date: clientData.date?.seconds
        ? new Date(clientData.date.seconds * 1000).toLocaleString()
        : new Date(clientData.date).toLocaleString(),
      reserved_seats: seatInfo, // Now combines seats and area
    };

    await emailjs.send(
      process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID,
      process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_DESK_ID,
      templateParams,
      process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY
    );

    return { success: true };
  } catch (error) {
    console.error('Failed to send email:', error);
    return { success: false, error };
  }
};

export const sendRejectionEmail = async (clientData, reason) => {
  try {
    const templateParams = {
      to_email: clientData.email,
      to_name: clientData.name,
      company: clientData.company,
      rejection_reason: reason,
      current_year: new Date().getFullYear(), // Add this line
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






export const sendMeetingAcceptanceEmail = async (reservationData) => {
  const PUBLIC_KEY = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY;
  const SERVICE_ID = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID;
  const TEMPLATE_ID = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID;

  if (!SERVICE_ID || !TEMPLATE_ID || !PUBLIC_KEY) {
    console.error(
      'EmailJS Service ID, Template ID, or Public Key is not defined. Please check your .env file.'
    );
    throw new Error('Email service configuration error.');
  }

  const templateParams = {
    to_name: reservationData.name,
    to_email: reservationData.email,
    meeting_date: new Date(reservationData.date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }),
    from_time: formatTime24h(reservationData.from_time),
    to_time: formatTime24h(reservationData.to_time),
    duration: reservationData.duration,
    guests: Array.isArray(reservationData.guests)
      ? reservationData.guests.join(', ')
      : typeof reservationData.guests === 'string'
      ? reservationData.guests
      : 'N/A',
  };

  try {
    await emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams, PUBLIC_KEY);
    console.log('Meeting acceptance email successfully sent!');
    return { success: true };
  } catch (error) {
    console.error('Failed to send meeting acceptance email:', error);
    throw new Error(`Failed to send email notification: ${error.message}`);
  }
};

// Helper function to convert time string or Firestore Timestamp to 24h format
function formatTime24h(time) {
  if (!time) return '';

  let dateObj;

  if (typeof time === 'object' && 'seconds' in time) {
    dateObj = new Date(time.seconds * 1000);
  } else if (typeof time === 'string' && time.includes(':')) {
    const pmMatch = time.match(/(\d{1,2}):(\d{2})\s*pm/i);
    const amMatch = time.match(/(\d{1,2}):(\d{2})\s*am/i);
    let hour, min;

    if (pmMatch) {
      hour = parseInt(pmMatch[1], 10);
      min = parseInt(pmMatch[2], 10);
      if (hour < 12) hour += 12;
    } else if (amMatch) {
      hour = parseInt(amMatch[1], 10);
      min = parseInt(amMatch[2], 10);
      if (hour === 12) hour = 0;
    } else {
      [hour, min] = time.split(':').map(Number);
    }

    dateObj = new Date();
    dateObj.setHours(hour, min, 0, 0);
  } else {
    return time;
  }

  const hh = dateObj.getHours().toString().padStart(2, '0');
  const mm = dateObj.getMinutes().toString().padStart(2, '0');
  return `${hh}:${mm}`;
}








export const sendSubscriptionExpiryNotification = async (client) => {
  const PUBLIC_KEY = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY;
  const SERVICE_ID = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID;
  const TEMPLATE_ID = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_EXPIRY_ID;

  if (!SERVICE_ID || !TEMPLATE_ID || !PUBLIC_KEY) {
    console.error(
      'EmailJS Service ID, Template ID, or Public Key is not defined. Please check your .env file.'
    );
    throw new Error('Email service configuration error.');
  }

  const templateParams = {
    to_name: client.name,
    to_email: client.email,
    company: client.company || 'N/A',
    expiry_date: client.expiry_date // Now using the pre-formatted date from the hook
  };

  try {
    await emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams, PUBLIC_KEY);
    console.log('Subscription expiry notification sent!');
    return { success: true };
  } catch (error) {
    console.error('Failed to send subscription expiry notification:', error);
    return { success: false, error };
  }
};
