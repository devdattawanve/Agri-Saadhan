import Image from 'next/image';

export function Logo() {
  return (
    <Image
      src="https://image2url.com/r2/default/images/1771445380556-a24b5bdb-a223-4afa-b35c-7223b22dff5c.png"
      alt="Agri Saadhan Logo"
      width={400}
      height={194}
      priority
    />
  );
}
