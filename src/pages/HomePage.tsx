import { Link } from 'react-router'
import { toolList } from '../routes.ts'

/** Top page: a list of links to the tools. */
function HomePage() {
  return (
    <main className="content-area">
      <section className="section">
        <div className="container is-max-desktop">
          <h1 className="title">Pokemon-Sleep Tools</h1>
          <ul>
            {toolList.map((tool) => (
              <li key={tool.path} className="mb-3">
                <Link to={tool.path} className="box tool-link">
                  {tool.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </main>
  )
}

export default HomePage
