import api from "../api/api";

export const paymentService = {
  /** Tạo link VNPay — trả về { payUrl, transId, amount } */
  createVNPay: (transId: number, returnUrl: string) =>
    api.post("/payment/create", { transId, returnUrl }),

  /** Download PDF hóa đơn */
  downloadInvoice: async (transId: number) => {
    const res = await api.get(`/transactions/${transId}/invoice`, {
      responseType: "blob",
    });
    const url  = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement("a");
    link.href  = url;
    link.setAttribute("download", `hoadon_vpt_${transId}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },
};
