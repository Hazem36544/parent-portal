import React, { useState } from 'react';
import { Edit3, X, Send } from 'lucide-react';
import { toast } from 'react-hot-toast';

const EditRequestModal = ({ onClose, onSubmit }) => {
    const [text, setText] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!text.trim()) {
            toast.error("يرجى كتابة التفاصيل المراد تعديلها");
            return;
        }
        onSubmit(text);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in" dir="rtl">
            <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl relative overflow-hidden">
                <div className="bg-[#1e3a8a] p-6 text-white flex justify-between items-center">
                    <h3 className="text-xl font-bold flex items-center gap-2">
                        <Edit3 size={20} />
                        طلب تعديل بيانات
                    </h3>
                    <button onClick={onClose} className="bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors border-none outline-none cursor-pointer">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 md:p-8">
                    <label className="block text-gray-700 font-bold mb-3 text-sm text-right">سبب طلب التعديل والتفاصيل</label>
                    <textarea 
                        className="w-full h-32 bg-gray-50 border border-gray-200 rounded-2xl p-4 focus:ring-2 focus:ring-[#1e3a8a] outline-none resize-none transition-all text-sm font-medium"
                        placeholder="يرجى توضيح البيانات المراد تعديلها (مثال: تم تغيير رقم الهاتف إلى 011...)"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                    ></textarea>
                    
                    <div className="mt-6 p-4 bg-blue-50 border border-blue-100 rounded-xl text-blue-800 text-xs font-bold text-center leading-relaxed">
                        سيتم إرسال هذا الطلب كشكوى/طلب لموظفي المحكمة لمراجعته وتحديث بياناتك الرسمية.
                    </div>

                    <div className="mt-8 flex flex-col sm:flex-row gap-4">
                        <button 
                            onClick={handleSubmit} 
                            className="w-full sm:flex-1 bg-[#1e3a8a] hover:bg-blue-900 text-white py-3.5 rounded-xl font-bold transition-all shadow-lg active:scale-95 border-none outline-none flex items-center justify-center gap-2 cursor-pointer"
                        >
                            <Send size={18} className="rtl:-scale-x-100" />
                            إرسال الطلب
                        </button>
                        <button 
                            onClick={onClose} 
                            className="w-full sm:flex-1 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 py-3.5 rounded-xl font-bold transition-all active:scale-95 outline-none flex items-center justify-center gap-2 cursor-pointer"
                        >
                            <X size={18} />
                            إلغاء
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EditRequestModal;