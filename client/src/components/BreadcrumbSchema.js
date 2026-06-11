import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const BreadcrumbSchema = () => {
  const location = useLocation();

  useEffect(() => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    
    // Build breadcrumb list
    const breadcrumbList = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Home",
          "item": "https://rageradar.com/"
        }
      ]
    };

    // Add path segments to breadcrumb
    let currentPath = '';
    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      const name = segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ');
      
      breadcrumbList.itemListElement.push({
        "@type": "ListItem",
        "position": index + 2,
        "name": name,
        "item": `https://rageradar.com${currentPath}`
      });
    });

    // Add or update breadcrumb script
    const scriptId = 'breadcrumb-schema';
    let script = document.getElementById(scriptId);
    
    if (script) {
      script.innerHTML = JSON.stringify(breadcrumbList);
    } else {
      script = document.createElement('script');
      script.id = scriptId;
      script.type = 'application/ld+json';
      script.innerHTML = JSON.stringify(breadcrumbList);
      document.head.appendChild(script);
    }

    return () => {
      const existingScript = document.getElementById(scriptId);
      if (existingScript && location.pathname === '/') {
        document.head.removeChild(existingScript);
      }
    };
  }, [location.pathname]);

  return null;
};

export default BreadcrumbSchema;
