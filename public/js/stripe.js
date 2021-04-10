import axios from 'axios';
import { showAlert } from './alert';
const stripe = Stripe(
  'pk_test_51Ie2scAtZ3npWhXt33Xt6x9ZgVhChJBBdA1z3feqrENeyMIqTKl8cA05oJ9N4rCUezKu0VsRfPbQWrwE2lcdmS6I00Wds749xz'
);

export const bookTour = async (tourId) => {
  //get checkout session from api
  try {
    const session = await axios(`http://127.0.0.1:3000/api/v1/bookings/checkout-session/${tourId}`);
    console.log(session);
    //create checkout form + charge credit card
    await stripe.redirectToCheckout({
      sessionId: session.data.session.id,
    });
  } catch (err) {
    console.log(err);
    showAlert('error', `✘ ${err}`);
  }
};
