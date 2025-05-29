export default function ServcorpBanner() {
  const mapUrl = `https://maps.googleapis.com/maps/api/staticmap?center=Tokyo-Uptown+BGC,+A.+Bonifacio+36+1637+Makati+National+Capital+Region&zoom=16&size=1200x600&maptype=roadmap&markers=color:red|Tokyo-Uptown+BGC,+A.+Bonifacio+36+1637+Makati+National+Capital+Region&key=AIzaSyCCkofkGxfEG_m9e2PmJPFtEu2veaZXX6g`;

  return (
    <div className="w-full h-[400px] flex bg-white">
      {/* Text Section */}
      <div className="w-2/3 h-full flex flex-col justify-center px-10 text-black">
        <h2 className="text-4xl font-light text-[#c29554] text-center">Not a I-Hub client?</h2>
        <p className="mt-4 text-lg text-[#c29554] text-center">
          Become part of a network of over 60,000 professionals. With offices and workspaces
          in 23 countries in some of the world's most prestigious locations.
        </p>
        <button className="mt-6 w-fit px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-black font-semibold rounded shadow-lg transition mx-auto">
          Sign up
        </button>
      </div>

      {/* Image Section */}
      <div className="w-2/3 flex items-center justify-center mr-6">
        <div
          className="w-full h-[350px] bg-cover bg-center rounded shadow-lg my-auto"
          style={{
            backgroundImage: `url('${mapUrl}')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
          }}
        />
      </div>
    </div>
  );
}
