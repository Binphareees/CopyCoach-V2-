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

const labelClass = "mb-1.5 block text-xs font-semibold text-text-secondary";
const fieldClass =
  "cc-field rounded-lg px-3.5 py-2.5 text-sm font-medium placeholder:text-text-muted";

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
    <div className="space-y-6">
      <div>
        <div className="mb-2 flex items-baseline justify-between gap-3">
          <label
            htmlFor="product-description"
            className="text-sm font-semibold text-text-primary"
          >
            Your copy to improve
          </label>
          <span className="text-[11px] tabular-nums text-text-muted">
            {description.length.toLocaleString()} characters
          </span>
        </div>
        <textarea
          id="product-description"
          rows={6}
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          placeholder="Paste the copy you want to improve, or describe the offer you want CopyCoach to write from scratch."
          className="cc-field min-h-[180px] rounded-2xl border-border p-5 text-[15px] leading-relaxed placeholder:text-text-muted"
        />
      </div>

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
          className={fieldClass}
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
            className={fieldClass}
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
            className={fieldClass}
          />
        </div>
      </div>
    </div>
  );
}