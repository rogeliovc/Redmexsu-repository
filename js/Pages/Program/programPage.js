import { getSupabase } from "../../services/supabaseService.js";

fetch("../../components/header.html")
  .then((res) => res.text())
  .then(
    (html) => (document.getElementById("header-container").innerHTML = html)
  );
fetch("../../components/footer.html")
  .then((res) => res.text())
  .then(
    (html) => (document.getElementById("footer-container").innerHTML = html)
  );

let events = [];

const loadEvents = async () => {
  const supabase = await getSupabase();
  if (events.length > 0) {
    return;
  }

  try {
    const { data, error } = await supabase
      .from("agenda")
      .select("*")
      .order("date", { ascending: false })
      .order("start_time", { ascending: false });
    if (error) {
      throw error;
    }
    events = data;
  } catch (error) {
    console.error("Error loading events:", error);
  }
};

const renderEvents = () => {
  const divListadoEventos = document.querySelector(".listado-eventos");
  divListadoEventos.innerHTML = "";
  try {
    if (events.length === 0) {
      const article = document.createElement("article");

      article.innerHTML = `
      <h2>No hay eventos para mostrar</h2>
      <p>Vuelve más tarde para consultar la agenda de actividades.</p>
    `;
      divListadoEventos.appendChild(article);

      return;
    }

    events.forEach((event) => {
      const article = document.createElement("article");
      article.classList.add("evento");
      let dia_de_la_semana = new Date(event.date).toLocaleDateString("es-ES", {
        weekday: "long",
      });
      event.date = `${dia_de_la_semana}, ${new Date(event.date).toLocaleString(
        "es-ES",
        { day: "numeric", month: "long", year: "numeric" }
      )}`;

      // Build images HTML separately
      let imagesHTML = "";
      event.img_url.forEach((image) => {
        imagesHTML += `<img src="${image}" alt="${event.description}" />`;
      });

      const formatTime = (timeString) => {
        return timeString.substring(0, 5);
      };

      article.innerHTML = `
      <h2>${event.date}</h2>
      <div class="contenido-evento">
        ${imagesHTML}
        <div>
          <span>${event.description}</span>
          <p>${formatTime(event.start_time)} - ${formatTime(event.end_time)}</p>
        </div>
      </div>
    `;

      divListadoEventos.appendChild(article);
    });
  } catch (error) {
    console.error("Error rendering events:", error);
  }
};

loadEvents()
  .then(() => {
    renderEvents();
  })
  .catch((error) => {
    console.error("Error loading and rendering events:", error);
  });
