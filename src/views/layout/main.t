{{^layout/base}}

{{#css_layout}}
  <link type="text/css" href="/css/lib/pure/menus.min.css" rel="stylesheet" />
{{/css_layout}}

{{#layout}}
<div id="container">

  {{#header}}
    {{header}}
      <header id="header" class="header">
        <nav id="header-nav" class="nav">
          {{+layout/nav}}
        </nav>
        {{#header_content}}{{/header_content}}
      </header>
    {{/header}}
  {{/header}}

  {{#sidebar}}{{/sidebar}}

  <main id="main" class="main">
    {{#content}}
      <section class="content">default content</section>
    {{/content}}
  </main>

  {{#footer}}
    {{footer}}
      <footer id="footer" class="footer">
        <nav id="footer-nav" class="nav">
          {{+layout/nav}}
        </nav>
        {{#footer_content}}{{/footer_content}}
      </footer>
    {{/footer}}
  {{/footer}}

</div>
{{/layout}}
