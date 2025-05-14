// src/components/header-component/header-nav-component.tsx
import { Component, Host, h } from '@stencil/core';

@Component({
  tag: 'header-nav-component',
  styleUrl: 'header-nav-component.css',
  shadow: true,
})
export class HeaderNavComponent {
  private navigate(path: string) {
    // pushState so AppComponent sees it
    window.history.pushState({}, '', path);
    // dispatch a popstate so AppComponent.updateView() runs
    window.dispatchEvent(new PopStateEvent('popstate'));
  }

  render() {
    return (
      <Host>
        <header class="header">
          <div class="nav-container">
            <div class="brand">Informačný systém zdravotných výkonov</div>
            <nav class="menu">
              <ul>
                <li>
                  <a
                    href="/ambulances"
                    class="nav-button"
                    onClick={e => {
                      e.preventDefault();
                      this.navigate('/ambulances');
                    }}
                  >
                    Ambulancie
                  </a>
                </li>

                <li>
                  <a
                    href="/procedures"
                    class="nav-button"
                    onClick={e => {
                      e.preventDefault();
                      this.navigate('/procedures');
                    }}
                  >
                    Výkony
                  </a>
                </li>
                <li>
                  <a
                    href="/about"
                    class="nav-button"
                    onClick={e => {
                      e.preventDefault();
                      this.navigate('/about');
                    }}
                  >
                    Logout
                  </a>
                </li>
              </ul>
            </nav>
          </div>
        </header>
      </Host>
    );
  }
}
