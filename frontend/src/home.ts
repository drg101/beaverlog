import { LitElement, html, css } from "lit";
import { customElement, property } from "lit/decorators.js";
import logo from "./assets/vite-deno.svg";
import { Chart } from "./chart.ts";
import { ChartPrefs, getChartPrefs } from "./chart-prefs.ts";

@customElement("home-element")
export class Home extends LitElement {
  @property()
  eventNames: string[] = [];

  @property()
  chartPrefs: ChartPrefs = getChartPrefs();

  constructor() {
    super();
    (async () => {
      const en: string[] = await (
        await fetch("http://localhost:8000/event-names")
      ).json();
      this.eventNames = en;
    })();
  }

  private setChartPrefs(prefs: ChartPrefs) {
    this.setChartPrefs(prefs);
    this.chartPrefs = prefs;
  }


  override render() {
    return html`<div id="header">
      <img id="logo" src=${logo} />
      <h1 id="title">Analytics placeholder</h1>
    </div>`;
  }

  static override styles = css`
    #header {
      height: 100px;
      display: flex;
      align-items: center;
      padding: 0 20px;
      gap: 15px;
    }

    #logo {
      height: 60px;
      width: 50px;
      flex-shrink: 0; /* Prevents logo from shrinking */
    }

    #title {
      margin: 0;
      font-size: 24px;
      color: #333;
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    "home-element": Home;
    "chart-element": Chart;
  }
}
