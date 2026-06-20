'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export interface PrintColumn {
  id: string;
  label: string;
  enabled: boolean;
  align: 'left' | 'center' | 'right';
  width?: string;
}

export interface PrintTemplate {
  storeName: string;
  address: string;
  phone: string;
  headerAlign: 'left' | 'center' | 'right';
  showLogo: boolean;
  fontSize: 'text-[10px]' | 'text-[12px]' | 'text-[14px]';
  columns: PrintColumn[];
  footerNote: string;
  showGifts: boolean;
  showDiscount: boolean;
}

interface DynamicPrintReceiptProps {
  invoice: any;
  template: PrintTemplate;
}

export const DEFAULT_PRINT_TEMPLATE: PrintTemplate = {
  storeName: "SV Store",
  address: "opp. Sri Sai Hospital, Guestine, Attibele",
  phone: "Tel: +91 9206116029",
  headerAlign: 'center',
  showLogo: false,
  fontSize: 'text-[12px]',
  columns: [
    { id: 'name', label: 'Item', enabled: true, align: 'left', width: 'flex-1' },
    { id: 'qty', label: 'Qty', enabled: true, align: 'center', width: 'w-10' },
    { id: 'price', label: 'Price', enabled: true, align: 'right', width: 'w-16' },
    { id: 'total', label: 'Total', enabled: true, align: 'right', width: 'w-20' },
  ],
  footerNote: "THANK YOU! Please visit again",
  showGifts: true,
  showDiscount: true,
};

export function DynamicPrintReceipt({ invoice, template }: DynamicPrintReceiptProps) {
  if (!invoice) return null;

  const getAlignClass = (align: string) => {
    if (align === 'center') return 'text-center';
    if (align === 'right') return 'text-right';
    return 'text-left';
  };

  return (
    <div className={cn(
      "hidden print:block print:fixed print:top-0 print:left-0 print:w-[80mm] print:bg-white print:text-black print:p-4 font-mono leading-tight",
      template.fontSize
    )}>
      {/* Dynamic Header */}
      <div className={cn("border-b border-dashed border-black pb-2 mb-2", getAlignClass(template.headerAlign))}>
        <h1 className="text-lg font-bold uppercase">{template.storeName}</h1>
        <p className="whitespace-pre-line">{template.address}</p>
        <p>{template.phone}</p>
      </div>

      {/* Meta Info */}
      <div className="mb-2 text-[10px] flex justify-between">
        <div>
          <p>INV: {invoice.id}</p>
          <p>CUST: {invoice.customer}</p>
        </div>
        <div className="text-right">
          <p>{invoice.date}</p>
        </div>
      </div>

      {/* Dynamic Items Table */}
      <div className="border-b border-dashed border-black mb-2 pb-1">
        {/* Table Header */}
        <div className="flex justify-between font-bold border-b border-black mb-1 pb-1">
          {template.columns.filter(col => col.enabled).map(col => (
            <span key={col.id} className={cn(col.width, getAlignClass(col.align))}>
              {col.label}
            </span>
          ))}
        </div>

        {/* Table Body */}
        {(invoice.items || []).map((item: any, idx: number) => (
          <div key={idx} className="flex justify-between mb-1 items-start">
            {template.columns.filter(col => col.enabled).map(col => {
              let content = "";
              if (col.id === 'name') content = item.shortCode || item.name;
              if (col.id === 'qty') content = item.quantity.toString();
              if (col.id === 'price') content = item.currentPrice.toFixed(2);
              if (col.id === 'total') content = (item.quantity * item.currentPrice).toFixed(2);
              
              return (
                <span key={col.id} className={cn(col.width, getAlignClass(col.align), "truncate")}>
                  {content}
                </span>
              );
            })}
          </div>
        ))}
      </div>

      {/* Totals Section */}
      <div className="space-y-1 border-t border-dashed border-black pt-1">
        <div className="flex justify-between font-bold text-sm">
          <span>NET TOTAL</span>
          <span>₹{invoice.total?.toFixed(2)}</span>
        </div>
        
        {template.showDiscount && invoice.couponDiscount > 0 && (
          <div className="flex justify-between text-[10px]">
            <span>REWARD DISCOUNT</span>
            <span>-₹{invoice.couponDiscount?.toFixed(2)}</span>
          </div>
        )}

        {template.showGifts && invoice.giftAllocations && invoice.giftAllocations.length > 0 && (
          <div className="pt-1 mt-1 border-t border-dotted border-black">
            <span className="font-bold text-[10px]">FREE GIFTS:</span>
            {invoice.giftAllocations.map((gift: any, idx: number) => (
              <div key={idx} className="flex justify-between text-[10px]">
                <span>{gift.quantity}x {gift.productName}</span>
                <span>FREE</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Dynamic Footer */}
      <div className="text-center mt-6 pt-4 border-t border-dashed border-black">
        <p className="font-bold uppercase tracking-widest text-[10px]">{template.footerNote}</p>
      </div>
    </div>
  );
}
