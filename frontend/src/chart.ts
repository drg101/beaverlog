import { LitElement, html, css } from "lit";
import { customElement, property } from "lit/decorators.js";
import { ChartPref } from "./chart-prefs.ts";
import { REFRESH_THRESHOLD_SEC, syncEvent } from "./sync.ts";

@customElement("chart-element")
export class Chart extends LitElement {
  @property()
  config: ChartPref | undefined;

  @property()
  interval: number | undefined;

  /** to force rerender */
  @property()
  lastUpdated: number = 0;

  constructor() {
    super();
    if (typeof this.interval === "undefined") {
      const i = setInterval(() => {
        this.resync();
      }, REFRESH_THRESHOLD_SEC);
      this.interval = i;
    }
  }

  private async resync() {
    if (!this.config) return;
    const updated = await syncEvent(this.config.eventName);
    if (updated) {
      this.lastUpdated = Date.now();
    }
  }

  /** @todo implement chart */
  override render() {
    if (!this.config) {
      return html`<div>No data</div>`;
    }
    const now = Date.now();
    const dateRange: [number, number] = [now - this.config.timePeriod, now];

    const chartName = `${this.config.eventName} - ${new Date(
      dateRange[0]
    ).toISOString()} -> ${new Date(dateRange[0]).toISOString()}`;
    return html`<div id="chart" key=${this.lastUpdated}>${chartName}</div>`;
  }

  static override styles = css`
    #chart {
      background-color: red;
      height: 100%;
      width: 100%;
    }
  `;
}
