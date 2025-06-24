export default function Footer() {
  return (
    <footer className="bg-gray-200 text-center p-4 mt-10">
      <p className="text-sm text-gray-600">
        © {new Date().getFullYear()} Appointo. All rights reserved.
      </p>
    </footer>
  );
}
