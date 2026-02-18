import Image from 'next/image';

export function Logo() {
  return (
    <Image
      src="/logo.png"
      alt="Agri Saadhan Logo"
      width={250}
      height={121}
      priority
    />
  );
}
