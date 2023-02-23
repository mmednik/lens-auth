import { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { client, challenge, authenticate } from '../api';

export default function Home() {
  const [address, setAddress] = useState();
  const [token, setToken] = useState();

  useEffect(() => {
    checkConnection();
  }, []);

  async function checkConnection() {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const accounts = await provider.listAccounts();

    if (accounts.length) {
      setAddress(accounts[0]);
    }
  }

  async function connect() {
    const account = await window.ethereum.send("eth_requestAccounts");

    if (account.result.length) {
      setAddress(account.result[0]);
    }
  }

  async function login() {
    try {
      const challengeInfo = await client.query({
        query: challenge,
        variables: { address },
      });
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const signature = await signer.signMessage(
        challengeInfo.data.challenge.text
      );
      const authData = await client.mutate({
        mutation: authenticate,
        variables: {
          address,
          signature,
        },
      });
      const {
        data: {
          authenticate: { accessToken },
        },
      } = authData;
      console.log({ accessToken });
      setToken(accessToken);
    } catch (error) {
      console.log("Error signing in: ", error);
    }
  }

  return (
    <div>
      {!address && <button onClick={connect}>Connect</button>}
      {address && !token && <button onClick={login}>Login</button>}
      {address && token && <h2>Signed in!</h2>}
    </div>
  );
}
