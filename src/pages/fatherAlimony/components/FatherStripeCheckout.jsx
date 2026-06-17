import React, { useState } from 'react';
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';
import { Loader2, CreditCard } from 'lucide-react';
import { toast } from 'react-hot-toast';

export const CheckoutForm = ({ amountFormatted, onSuccess, onCancel }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setIsProcessing(true);
    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: window.location.href },
      redirect: 'if_required',
    });
    if (error) {
      toast.error(error.message || "حدث خطأ أثناء معالجة الدفع.");
      setIsProcessing(false);
    } else if (paymentIntent && paymentIntent.status === 'succeeded') {
      onSuccess();
    } else {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 bg-white p-2 rounded-xl">
      <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 mb-2">
          <PaymentElement />
      </div>
      <div className="flex gap-3 mt-2">
         <button type="button" onClick={onCancel} disabled={isProcessing} className="flex-1 bg-white border border-gray-300 text-gray-700 font-bold py-3.5 rounded-xl hover:bg-gray-50 transition-colors shadow-sm outline-none cursor-pointer">إلغاء</button>
         <button type="submit" disabled={!stripe || isProcessing} className="flex-[2] bg-[#1e3a8a] text-white font-bold py-3.5 rounded-xl hover:bg-blue-900 transition-colors flex items-center justify-center gap-2 shadow-md outline-none cursor-pointer border-none disabled:opacity-70">
            {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : <><CreditCard className="w-5 h-5" /> تأكيد الدفع ({amountFormatted} ج.م)</>}
         </button>
      </div>
    </form>
  );
};