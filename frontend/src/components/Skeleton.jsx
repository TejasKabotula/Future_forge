import React from 'react';

const Skeleton = ({ className, variant = "text" }) => {
    // Variants: text, circle, rectangular
    const baseClasses = "bg-white/5 animate-pulse rounded-md";

    let sizingClasses = "";
    if (variant === "text") sizingClasses = "h-4 w-full";
    if (variant === "circle") sizingClasses = "rounded-full";

    return (
        <div className={`${baseClasses} ${sizingClasses} ${className}`} />
    );
};

export default Skeleton;
