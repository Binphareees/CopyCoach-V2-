"use client";

import React from "react";

interface ProductDetailsProps {
  productName: string;
  onProductNameChange: (value: string) => void;
  description: string;
  onDescriptionChange: (value: string) => void;
  targetAudience: string;
  onTargetAudienceChange: (value: string) => void;
  cta: string;
  onCtaChange: (value: string) => void;
}

const labelClass =
  "mb-2 block text-[11px] font-semibold uppercase tracking-[0.12em] text-brand-300";
const inputClass =
  "cc-input w-full rounded-2xl border border-glass-input-border bg-glass-input-bg px-4 py-3.5 text-[15px] font-medium text-brand-100";

export default function ProductDetails({
  productName,
  onProductNameChange,
  description,
  onDescriptionChange,
  targetAudience,
  onTargetAudienceChange,
  cta,
  onCtaChange,
}: ProductDetailsProps) {
  return (
    <div className="space-y-5">
      <div>
        <label htmlFor="product-name" className={labelClass}>
          Product / Brand Name
        </label>
        <input
          id="product-name"
          type="text"
          value={productName}
          onChange={(e) => onProductNameChange(e.target.value)}
          placeholder="Product / Brand Name"
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="product-description" className={labelClass}>
          Product Description / Core Offer
        </label>
        <textarea
          id="product-description"
          rows={6}
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          placeholder="Product Description / Core Offer"
          className={`${inputClass} resize-none leading-relaxed`}
        />
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="target-audience" className={labelClass}>
            Target Audience
          </label>
          <input
            id="target-audience"
            type="text"
            value={targetAudience}
            onChange={(e) => onTargetAudienceChange(e.target.value)}
            placeholder="e.g. Busy professionals, founders"
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="cta" className={labelClass}>
            Call To Action (CTA)
          </label>
          <input
            id="cta"
            type="text"
            value={cta}
            onChange={(e) => onCtaChange(e.target.value)}
            placeholder="e.g. Get Started Free"
            className={inputClass}
          />
        </div>
      </div>
    </div>
  );
}