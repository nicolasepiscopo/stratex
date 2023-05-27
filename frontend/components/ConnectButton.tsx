import { useEffect, useRef, useState } from "react";
import { useWeb3React } from "@web3-react/core";
import useMetaMaskOnboarding from "../hooks/useMetaMaskOnboarding";
import Button from "@mui/material/Button";
import { UserRejectedRequestError } from "@web3-react/injected-connector";
import { injected } from "../connectors";
import { useRouter } from "next/router";

interface ConnectButtonProps {
  title?: string;
}

export function ConnectButton ({ title }: ConnectButtonProps) {
  const { activate, setError, active, error } = useWeb3React();
  const {
    isMetaMaskInstalled,
    isWeb3Available,
    startOnboarding,
    stopOnboarding
  } = useMetaMaskOnboarding();
  const router = useRouter();

  // manage connecting state for injected connector
  const [connecting, setConnecting] = useState(false);

  useEffect(() => {
    if (active || error) {
      setConnecting(false);
      stopOnboarding();
    }
  }, [active, error, stopOnboarding]);

  let buttonTitle = 'Install Metamask';

  if (title) {
    buttonTitle = title;
  } else if (isWeb3Available) {
    buttonTitle = isMetaMaskInstalled ? 'Connect to MetaMask' : 'Connect to Wallet';
  }

  return (
    <div>
      <Button
        variant="contained"
        color="primary"
        disabled={connecting}
        onClick={() => {
          if (!isWeb3Available) {
            startOnboarding();
            return;
          }
          
          setConnecting(true);

          activate(injected, undefined, true).then(() => {
            router.push("/app");
          }).catch((error) => {
            // ignore the error if it's a user rejected request
            if (error instanceof UserRejectedRequestError) {
              setConnecting(false);
            } else {
              setError(error);
            }
          });
        }}
      >
        {buttonTitle}
      </Button>
    </div>
  );
}