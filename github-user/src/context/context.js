import React, { useState, useEffect, createContext } from "react";
import mockUser from "./mockData.js/mockUser";
import mockRepos from "./mockData.js/mockRepos";
import mockFollowers from "./mockData.js/mockFollowers";
import axios from "axios";

const rootUrl = "https://api.github.com";

const GithubContext = createContext();

const GithubProvider = ({ children }) => {
  const [githubUser, setGithubUser] = useState(mockUser);
  const [repos, setGithubRepos] = useState(mockRepos);
  const [followers, setGithubFollowers] = useState(mockFollowers);
  const [requests, setRequests] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState({ show: false, msg: "" });

  const searchGithubUser = async user => {
    toggelError(false, "");
    setIsLoading(true);
    const response = await axios(`${rootUrl}/users/${user}`).catch(err =>
      console.log(err)
    );

    if (response) {
      setGithubUser(response.data);

      const { login, followers_url } = response.data;
      console.log(followers_url, login);

      // repos from user
      axios(`${rootUrl}/users/${login}/repos?per_page=100`).then(response =>
        setGithubRepos(response.data)
      );

      // followers from user
      axios(`${followers_url}`).then(
        response => setGithubFollowers(response.data),
        console.log(response.data)
      );
    } else {
      toggelError(true, "there is no such as user!!");
    }
    setIsLoading(false);
  };

  const CheckRequests = () => {
    axios(`${rootUrl}/rate_limit`)
      .then(({ data }) => {
        let {
          rate: { remaining },
        } = data;
        // remaining=0
        setRequests(remaining);
        if (remaining === 0) {
          toggelError(
            true,
            "Soory,You do not have hourly request for search!! come back after one hour"
          );
        }
      })
      .catch(err => console.log(err));
  };

  function toggelError(show, msg) {
    setError({ show, msg });
  }
  useEffect(CheckRequests, []);

  return (
    <GithubContext.Provider
      value={{
        githubUser,
        repos,
        followers,
        requests,
        error,
        searchGithubUser,
        isLoading,
      }}
    >
      {children}
    </GithubContext.Provider>
  );
};

export { GithubContext, GithubProvider };
