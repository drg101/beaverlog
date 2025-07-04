import { LitElement, html, css } from "lit";
import { customElement, property } from "lit/decorators.js";
import logo from "./assets/vite-deno.svg";

@customElement("home-element")
export class Home extends LitElement {
  @property({ type: Number })
  count = 0;

  override render() {
    // Header with logo at top left, and name
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

  private _onClick() {
    this.count++;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "home-element": Home;
  }
}