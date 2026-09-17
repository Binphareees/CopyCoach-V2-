'use client';
import React, { useState } from 'react';
import DefaultAvatar from './DefaultAvatar';

interface UserAvatarProps {
  src?: string;
  alt?: string;
  className?: string;
}

export const UserAvatar: React.FC<UserAvatarProps> = ({ src, alt, className = '' }) => {
  const [failed, setFailed] = useState(false);
  if (!src || failed) {
    return <DefaultAvatar className={className} />;
  }
  return (
    <img
      src={src}
      alt={alt}
      onError={() => setFailed(true)}
      className={`h-full w-full object-cover ${className}`}
    />
  );
};

export default UserAvatar;