class LocationMap extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });

    // Contenedor de mapa y lista
    this.shadowRoot.innerHTML = `
      <style>
        #map {
          width: 100%;
          height: 800px;
          border-radius: 12px;
        }
        ul {
          list-style: none;
          padding: 0;
          margin-top: .5rem;
        }
        li {
          margin-bottom: .5rem;
          padding: .5rem;
          border: 1px solid #ddd;
          border-radius: 8px;
          cursor: pointer;
          background: white;
          transition: background 0.2s;
        }
        li:hover {
          background: #f0f0ff;
        }
      </style>

      <div id="map"></div>
      <ul id="location-list"></ul>
    `;
  }

  connectedCallback() {
    // Datos
    this.locations = [
      {
        name: "Coordinación General de Tecnologías de información",
        description:
          "Av. Juárez No.976 Planta Baja,Centro,44100 Guadalajara, Jal.,México<br>URL: www.cgti.udg.mx<br>Tel: +52 33 3134 2221",
        position: { lat: 20.6754477, lng: -103.3591366 },
        website: "https://www.cgti.udg.mx",
      },
      {
        /*
        estos son los datos
        name
Centro Nacional de Supercómputo
Detalles de Google Maps
Cam. a la Presa de San José 2055. Col, Lomas 4ta Secc, 78216 San Luis Potosí, S.L.P.
+52 444 454 4000
www.cns.ipicyt.edu.mx
5.0
Ver en Google Maps
        */
        name: "Centro Nacional de supercómputo",
        description:
          "Detalles de Google Maps<br>Cam. a la Presa de San José 2055. Col, Lomas 4ta Secc, 78216 San Luis Potosí, S.L.P.<br>Tel: +52 444 454 4000",
        position: { lat: 22.150149, lng: -101.036459 },
        website: "http://www.cns.ipicyt.edu.mx",
      },
      /*
      estos son los datos
      name
Laboratorio de Supercómputo, UAEMéx
description
lancad.mx
      */
      {
        name: "Laboratorio de Supercómputo, UAEMéx",
        position: { lat: 19.4098057, lng: -99.6887351 },
        website: "http://lancad.mx",
        // MUY MUY MUY MUY CUESTIONABLE MUYYYYYYYYYYYYYYYYYYY
      },
      /*
      ABACUS Centro Hibrido de supercómputo
      Carr. México - Toluca, 52743 Mex.
      */
      {
        name: "ABACUS Centro Hibrido de supercómputo",
        description:
          "Detalles de Google Maps<br>Carr. México - Toluca, 52743 Mex.",
        position: { lat: 19.298479, lng: -99.405228 },
      },
      /*
      Estos son los datos
      DGTIC, UNAM
      Universidad Nacional Autónoma de México, Cto. Exterior s/n, C.U., Coyoacán, 04510 Ciudad de México, CDMX
      tic.unam.mx
      */
      {
        name: "DGTIC, UNAM",
        description:
          "Universidad Nacional Autónoma de México, Cto. Exterior s/n, C.U., Coyoacán, 04510 Ciudad de México, CDMX",
        position: { lat: 19.322283, lng: -99.18458 },
        website: "http://tic.unam.mx",
      },
      /*
      Estos son los datos
      Laboratorio Nacional de computo de alto rendimiento y visualización en paralelo
      Av. San Rafael Atlixco 108, Leyes de Reforma 1ra Secc, Iztapalapa, 09310 Ciudad de México, CDMX
      lancad.mx
      */
      {
        name: "Laboratorio Nacional de computo de alto rendimiento y visualización en paralelo",
        description:
          "Av. San Rafael Atlixco 108, Leyes de Reforma 1ra Secc, Iztapalapa, 09310 Ciudad de México, CDMX",
        position: { lat: 19.361621, lng: -99.073902 },
        website: "http://lancad.mx",
      },
      /*
      Estos son los datos
      Coordinación general de servicios de tecnologías de la información y comunicaciones/Xiuhcoatl CINVESTAV
      Av Instituto Politécnico Nacional 2508, San Pedro Zacatenco, Gustavo A. Madero, 07360 Ciudad de México, CDMX
      clusterhibrido.cinvestav.mx
      */
      {
        name: "Coordinación general de servicios de tecnologías de la información y comunicaciones/Xiuhcoatl CINVESTAV",
        description:
          "Av Instituto Politécnico Nacional 2508, San Pedro Zacatenco, Gustavo A. Madero, 07360 Ciudad de México, CDMX",
        position: { lat: 19.509037, lng: -99.127485 },
        website: "http://clusterhibrido.cinvestav.mx",
      },
      /*
      Estos son los datos
      Laboratorio Nacional de Supercómputo del Sureste de Mexico
      Cd Universitaria, Cdad. Universitaria, 72592 Heroica Puebla de Zaragoza, Pue.
      https://lns.buap.mx/
      */
      {
        name: "Laboratorio Nacional de Supercómputo del Sureste de Mexico",
        description:
          "Cd Universitaria, Cdad. Universitaria, 72592 Heroica Puebla de Zaragoza, Pue.",
        position: { lat: 18.995073, lng: -98.200369 },
        website: "https://lns.buap.mx/",
      },
      /*
      Estos son los datos
      Laboratorio Regional de Computo de Alto Desempeno , UNACH
      Ciudad Universitaria, Calz. Emiliano Zapata km 4, 29055 Tuxtla Gutiérrez, Chis.
      dcs.unach.mx
      */
      {
        name: "Laboratorio Regional de Computo de Alto Desempeno , UNACH",
        description:
          "Ciudad Universitaria, Calz. Emiliano Zapata km 4, 29055 Tuxtla Gutiérrez, Chis.",
        position: { lat: 16.694347, lng: -93.185496 },
        website: "http://dcs.unach.mx",
      },
      /*
      Estos son los datos
      ACARUS
      3K1, Av. Luis Donaldo Colosio Murrieta S/N, Edificio, Centro, 83000 Hermosillo, Son.
      acarus.uson.mx
      */
      {
        name: "ACARUS",
        description:
          "3K1, Av. Luis Donaldo Colosio Murrieta S/N, Edificio, Centro, 83000 Hermosillo, Son.",
        position: { lat: 29.072611, lng: -110.955569 },
        website: "http://acarus.uson.mx",
      },
      /*
      Estos son los datos
      Departamento de Ciencias de la Computación y Telemática
      Ensenada-Tijuana 3918, C.I.C.E.S.E., 22860 Ensenada, B.C.
      https://telematica.cicese.mx/
      */
      {
        name: "Departamento de Ciencias de la Computación y Telemática",
        description:
          "Ensenada-Tijuana 3918, C.I.C.E.S.E., 22860 Ensenada, B.C.",
        position: { lat: 31.871358, lng: -116.667442 },
        website: "https://telematica.cicese.mx/",
      }

    ];

    // Esperar a que Google Maps API esté cargada
    if (window.google && window.google.maps) {
      this.initMap();
    } else {
      console.error(
        "Google Maps API no está cargada. Revisa tu <script src='...'>"
      );
    }
  }

  initMap() {
    const mapEl = this.shadowRoot.getElementById("map");
    this.map = new google.maps.Map(mapEl, {
      center: { lat: 25, lng: -110 },
      zoom: 5.8,
    });

    this.infoWindow = new google.maps.InfoWindow();
    this.markers = [];

    this.locations.forEach((loc, index) => {
      const marker = new google.maps.Marker({
        position: loc.position,
        map: this.map,
        title: loc.name,
      });

      marker.addListener("click", () => {
        this.showInfo(marker, loc);
      });

      this.markers.push(marker);
    });

    this.renderList();
  }

  showInfo(marker, loc) {
    this.infoWindow.setContent(`
      <div style="font-family:system-ui;">
        <h3>${loc.name}</h3>
        ${loc.description ? `<p>${loc.description}</p>` : ""}
        ${
          loc.website
            ? `<a href="${loc.website}" target="_blank">Visitar sitio web</a>`
            : ""
        }
      </div>
    `);
    this.infoWindow.open(this.map, marker);
  }

  renderList() {
    const list = this.shadowRoot.getElementById("location-list");
    list.innerHTML = "";

    this.locations.forEach((loc, index) => {
      const li = document.createElement("li");
      li.textContent = loc.name + " – " + (loc.website ? loc.website : "");

      li.addEventListener("click", () => {
        this.map.panTo(loc.position);
        this.map.setZoom(15);
        this.showInfo(this.markers[index], loc);
      });

      list.appendChild(li);
    });
  }
}

// Registrar el componente
customElements.define("location-map", LocationMap);
