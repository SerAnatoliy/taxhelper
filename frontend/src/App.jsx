import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Landing from './components/Landing';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        {/* Додай пізніше: /register, /login, /dashboard */}
      </Routes>
    </Router>
  );
}

export default App;