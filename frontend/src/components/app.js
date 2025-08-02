import React, { Component } from "react";
import { createRoot } from "react-dom/client";
import { HashRouter as Router } from "react-router-dom";
import HomePage from "./HomePage";

export default class App extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div className="center">
        <Router>
          <HomePage />
        </Router>
      </div>
    );
  }
}

const appDiv = document.getElementById("app");
const root = createRoot(appDiv);
root.render(<App />);