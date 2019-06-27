import React, { Suspense } from "react";
import ReactDOM from "react-dom";
import { Router } from "@reach/router";
import useFetch from "fetch-suspense";

import PhoneNumberUtil from "google-libphonenumber";

import "./styles.css";

const PNF = PhoneNumberUtil.PhoneNumberFormat;
const pnu = PhoneNumberUtil.PhoneNumberUtil.getInstance();

const whatsappFormat = pn => `https://wa.me/${pn.slice(1)}`;

const parseNumForTel = num => (num.startsWith("tel:") ? num.slice(4) : num);

const isTypicalPhoneNumberLength = np => np.length > 5;

const seemsLikeValidIntlNumber = np =>
  isTypicalPhoneNumberLength(np) && np.startsWith("+");

const missingCountryCode = isTypicalPhoneNumberLength;

const isProbablyMobileNumber = pn => {
  const pnType = pnu.getNumberType(pn);
  const output =
    pnType === PhoneNumberUtil.PhoneNumberType.MOBILE ||
    pnType === PhoneNumberUtil.PhoneNumberType.FIXED_LINE_OR_MOBILE;

  return output;
};

const getNum = (calling_code, num) => {
  const np = parseNumForTel(num);

  const checkForMobilePhoneAndFormat = pn => {
    if (isProbablyMobileNumber(pn)) {
      return pnu.format(pn, PNF.E164);
    } else {
      return "";
    }
  };

  if (seemsLikeValidIntlNumber(np)) {
    const pn = pnu.parseAndKeepRawInput(np);
    return checkForMobilePhoneAndFormat(pn);
  } else if (missingCountryCode(np)) {
    const guessedCountryCode = "+" + calling_code + np;
    const pn = pnu.parseAndKeepRawInput(guessedCountryCode);
    return checkForMobilePhoneAndFormat(pn);
  }

  return "";
};

function Phone({ num }) {
  const { calling_code } = useFetch(
    "https://api.ipdata.co/?api-key=23b8adece73fdaf1842b266e6cef7d63ba46e488e75dccc9cbf74e70"
  );
  const pn = getNum(calling_code, num);
  if (pn.length > 5) {
    window.location.href = whatsappFormat(pn);
    return <span>Redirecting to Whatsapp Web now</span>;
  } else {
    return (
      <span>
        Number from the link was probably a landline, or otherwise invalid.
        <span role="img" aria-label="unknown error shrug">
          🤷‍♂️
        </span>
      </span>
    );
  }
}

function GettingStarted() {
  const exampleLink = `tel:+14155238886`;
  return (
    <aside>
      <span>To get started, find a tel: link on a webpage like this one: </span>
      <a href={exampleLink}>{exampleLink}.</a>
    </aside>
  );
}

const registerPhoneHandler = () => {
  const protocol = "tel";
  const url = "https://0two4.codesandbox.io/sendWhatsappTo/%s";
  const title = "Whatsapp Web message sending";

  navigator.registerProtocolHandler(protocol, url, title);
};

function Controls({ num }) {
  return (
    <Suspense fallback="Detecting your current location...">
      <Phone num={num} />
    </Suspense>
  );
}

function App() {
  registerPhoneHandler();

  return (
    <div className="App">
      <h1>
        <span role="img" aria-label="mobile phone">
          📱
        </span>{" "}
        Whatsapp Web Telephone Handler{" "}
        <span role="img" aria-label="destination phone">
          📲
        </span>
      </h1>
      <h2>
        For sending messages{" "}
        <span role="img" aria-label="outgoing sender">
          📤
        </span>{" "}
        to phone numbers{" "}
        <span role="img" aria-label="destination phone">
          📲
        </span>{" "}
        from tel: links{" "}
        <span role="img" aria-label="telephone link">
          🔗
        </span>{" "}
        on webpages{" "}
        <span
          role="img"
          aria-label="outgoing sender is meant to be desktop computers"
        >
          🖥
        </span>
        !
      </h2>

      <Router>
        <GettingStarted path="/" />
        <Controls path="/sendWhatsappTo/:num" />
      </Router>
    </div>
  );
}

const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);
