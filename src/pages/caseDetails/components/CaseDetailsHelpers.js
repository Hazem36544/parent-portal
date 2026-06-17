export const formatDate = (dateStr) => {
  if (!dateStr) return 'غير محدد';
  return new Date(dateStr).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' });
};

export const getCustodianName = (custody, family) => {
  if (!custody || !family) return 'لم يصدر قرار / غير محدد';
  if (custody.custodialParentId === family.mother?.id) return family.mother?.fullName;
  if (custody.custodialParentId === family.father?.id) return family.father?.fullName;
  return 'غير محدد';
};

export const translateFrequency = (freq) => {
  if (freq === 'Weekly') return 'أسبوعياً';
  if (freq === 'Monthly') return 'شهرياً';
  return freq || 'غير محدد';
};