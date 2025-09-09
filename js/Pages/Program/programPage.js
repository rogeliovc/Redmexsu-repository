import { getSupabase } from "../../services/supabaseService.js";

// Cargar header y footer
fetch("../../components/header.html")
  .then((res) => res.text())
  .then((html) => (document.getElementById("header-container").innerHTML = html))
  .catch(error => console.error("Error loading header:", error));

fetch("../../components/footer.html")
  .then((res) => res.text())
  .then((html) => (document.getElementById("footer-container").innerHTML = html))
  .catch(error => console.error("Error loading footer:", error));

let events = [];
let upcomingEvents = [];
let pastEvents = [];

const formatEventDate = (event) => {
  const eventDate = new Date(event.date);
  const dia_de_la_semana = eventDate.toLocaleDateString("es-ES", {
    weekday: "long",
  });
  const formattedDate = eventDate.toLocaleDateString("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric"
  });
  return {
    ...event,
    formattedDate: `${dia_de_la_semana}, ${formattedDate}`,
    dateObj: eventDate
  };
};

const isEventUpcoming = (event) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return event.dateObj >= today;
};

const loadEvents = async () => {
  const supabase = await getSupabase();
  
  try {
    const { data, error } = await supabase
      .from("agenda")
      .select("*")
      .order("date", { ascending: true })
      .order("start_time", { ascending: true });
    
    if (error) throw error;
    
    // Formatear fechas y separar eventos
    const formattedEvents = data.map(formatEventDate);
    upcomingEvents = formattedEvents.filter(isEventUpcoming);
    pastEvents = formattedEvents.filter(event => !isEventUpcoming(event));
    
    // Ordenar eventos pasados del más reciente al más antiguo
    pastEvents.sort((a, b) => b.dateObj - a.dateObj);
    
  } catch (error) {
    console.error("Error loading events:", error);
    throw error;
  }
};

const createEventElement = (event) => {
  const article = document.createElement("article");
  article.classList.add("evento");
  
  // Build images HTML
  let imagesHTML = event.img_url?.map(image => 
    `<img src="${image}" alt="${event.description}" />`
  ).join('') || '';

  const formatTime = (timeString) => timeString?.substring(0, 5) || '';

  article.innerHTML = `
    <h2>${event.formattedDate}</h2>
    <div class="contenido-evento">
      ${imagesHTML}
      <div>
        <span>${event.description}</span>
        <p>${formatTime(event.start_time)} - ${formatTime(event.end_time)}</p>
        ${event.location ? `<p class="event-location">📍 ${event.location}</p>` : ''}
      </div>
    </div>
  `;
  
  return article;
};

const renderEvents = () => {
  const upcomingContainer = document.querySelector(".listado-eventos-proximos");
  const pastContainer = document.querySelector(".listado-eventos");
  
  // Render upcoming events
  if (upcomingEvents.length === 0) {
    upcomingContainer.innerHTML = `
      <article class="no-events">
        <p>No hay eventos próximos programados.</p>
      </article>
    `;
  } else {
    upcomingContainer.innerHTML = '';
    upcomingEvents.forEach(event => {
      upcomingContainer.appendChild(createEventElement(event));
    });
  }
  
  // Render past events
  if (pastEvents.length === 0) {
    pastContainer.innerHTML = `
      <article class="no-events">
        <p>No hay eventos anteriores para mostrar.</p>
      </article>
    `;
  } else {
    pastContainer.innerHTML = '';
    pastEvents.forEach(event => {
      pastContainer.appendChild(createEventElement(event));
    });
  }
  
  // Remove loading messages
  document.querySelectorAll('.cargando').forEach(el => el.remove());
};

// Inicializar la página
const init = async () => {
  try {
    await loadEvents();
    renderEvents();
    
    // Opcional: Actualizar automáticamente los eventos cada hora
    setInterval(async () => {
      await loadEvents();
      renderEvents();
    }, 3600000); // 1 hora
    
  } catch (error) {
    console.error("Error initializing page:", error);
    
    // Mostrar mensaje de error
    const containers = [
      document.querySelector(".listado-eventos-proximos"),
      document.querySelector(".listado-eventos")
    ];
    
    containers.forEach(container => {
      if (container) {
        container.innerHTML = `
          <article class="error">
            <p>Error al cargar los eventos. Por favor, intente recargar la página.</p>
          </article>
        `;
      }
    });
  }
};

// Iniciar la aplicación cuando el DOM esté listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
