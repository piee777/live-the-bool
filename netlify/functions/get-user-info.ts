import type { Handler, HandlerEvent, HandlerContext } from "@netlify/functions";

export const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  // Netlify provides the client's IP address in this header.
  const clientIp = event.headers['x-nf-client-connection-ip'] || null;

  if (!clientIp) {
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ip: 'IP غير متوفر', country: null }),
    };
  }
  
  // Use a more reliable geolocation API to get the country
  try {
    const geoResponse = await fetch(`https://ipinfo.io/${clientIp}/json`);
    if (geoResponse.ok) {
        const geoData = await geoResponse.json();
        // ipinfo.io returns a country code (e.g., "SA"). Convert it to the full Arabic name.
        const countryName = geoData.country ? new Intl.DisplayNames(['ar'], { type: 'region' }).of(geoData.country) : null;
        
        return {
            statusCode: 200,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ip: clientIp, country: countryName || geoData.country || null }),
        };
    } else {
        // Geolocation service failed, return IP only
        console.warn("Geolocation service failed:", geoResponse.statusText);
        return {
            statusCode: 200,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ip: clientIp, country: null }),
        };
    }
  } catch (error) {
    console.error("Error fetching geolocation data:", error);
    // Error during fetch, return IP only
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ip: clientIp, country: null }),
    };
  }
};
