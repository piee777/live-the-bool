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
  
  // Use a free geolocation API to get the country
  try {
    const geoResponse = await fetch(`http://ip-api.com/json/${clientIp}?fields=country`);
    if (geoResponse.ok) {
        const geoData = await geoResponse.json();
        const country = geoData.country || null;
        
        return {
            statusCode: 200,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ip: clientIp, country: country }),
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
