import React, {useCallback, useEffect, useState} from 'react';
import {Accordion, Button, Form} from 'react-bootstrap';
import {CopyToClipboard} from 'react-copy-to-clipboard';
import './App.css';

function App() {
  const [list, setList]: any = useState([]);
  const [badges, setBadges]: any = useState({});
  const [badgeStyle, setBadgeStyle]: any = useState('plastic');

  const badgeStyles = [
    {label: 'Plastic', value: 'plastic'},
    {label: 'Flat', value: 'flat'},
    {label: 'Flat Square', value: 'flat-square'},
    {label: 'For the Badge', value: 'for-the-badge'},
    {label: 'Social', value: 'Social'},
  ];

  const convertMarkdownToObjects = useCallback(
    (markdown: any) => {
      const lines = markdown.split('\n');
      const sections = [];

      let currentSection = null;
      let currentBadges = [];

      for (const line of lines) {
        if (line.startsWith('###')) {
          if (currentSection) {
            sections.push({section: currentSection, badges: currentBadges});
            currentBadges = [];
          }
          currentSection = line.substring(4).trim();
        } else if (
          line.startsWith('|') &&
          !line.startsWith('| ---') &&
          !line.startsWith('| Name')
        ) {
          const columns = line.split('|').map((col: any) => col.trim());
          if (columns && columns.length >= 4) {
            const name = columns[1];
            let link = columns[2].match(/\((.*?)\)/)?.[1];
            link = link.replace(/style=([^&]*)/, `style=${badgeStyle}`);
            currentBadges.push({name, link});
          }
        }
      }

      if (currentSection) {
        sections.push({section: currentSection, badges: currentBadges});
      }

      return sections;
    },
    [badgeStyle]
  );

  const fetchMarkdown = useCallback(() => {
    const url =
      'https://raw.githubusercontent.com/Ileriayo/markdown-badges/master/README.md';
    const headers = new Headers();

    // If authentication is required, add the token to the request headers
    // headers.append('Authorization', 'Bearer ' + token);

    fetch(url, {headers})
      .then((response) => response.text())
      .then((data) => {
        const startIndex = data.indexOf('# Badges');
        if (startIndex === -1) {
          console.error('Could not find the "Badges" header');
          return;
        }

        const badgesContent = data.substring(startIndex);
        const badgesList = convertMarkdownToObjects(badgesContent);
        setList(badgesList);
      });
  }, [convertMarkdownToObjects]);

  useEffect(() => {
    fetchMarkdown();
  }, [fetchMarkdown]);

  const handleCheckboxes = (event: any, badge: any) => {
    if (event.target.checked) {
      setBadges({
        ...badges,
        [badge.name]: badge.link,
      });
    } else {
      const filteredBadges = Object.keys(badges)
        .filter((key) => key !== badge.name)
        .reduce((obj: any, key) => {
          obj[key] = badges[key];
          return obj;
        }, {});
      setBadges(filteredBadges);
    }
  };

  const generateMarkdownPreview = () => {
    if (!badges) return '';
    const markdownContent = Object.entries(badges)
      .map(([name, link]) => `[![${name}](${link})](${link})`)
      .join('\n');
    return markdownContent;
  };

  const handleStyles = (_event: any, style: string) => {
    const newBadges = Object.keys(badges).reduce((obj: any, key) => {
      obj[key] = badges[key].replace(/style=([^&]*)/, `style=${style}`);
      return obj;
    }, {});
    setBadges(newBadges);
    setBadgeStyle(style);
  };

  return (
    <div className='App'>
      <header className='App-header'>
        <h1>markdown-badges generator</h1>
        <h3>
          <a href='https://github.com/sharynneazhar/markdown-badges-generator'>
            GitHub
          </a>
        </h3>
      </header>
      <main>
        <Accordion defaultActiveKey='0'>
          {list.map((item: any, index: string) => {
            return (
              <Accordion.Item key={index} eventKey={index}>
                <Accordion.Header>{item.section}</Accordion.Header>
                <Accordion.Body>
                  {item.badges.map((badge: any, index: string) => {
                    return (
                      <Form.Check
                        key={index}
                        type='checkbox'
                        id={badge.name}
                        label={badge.name}
                        checked={badges[badge.name] || false}
                        onChange={(e) => handleCheckboxes(e, badge)}
                      />
                    );
                  })}
                </Accordion.Body>
              </Accordion.Item>
            );
          })}
        </Accordion>
      </main>
      <section>
        <div className='styles'>
          <h3>Choose a Style</h3>
          <div className='input-group'>
            {badgeStyles.map((style, index) => (
              <Form.Check
                key={index}
                id={style.value}
                type='radio'
                label={style.label}
                checked={badgeStyle === style.value}
                onChange={(e) => handleStyles(e, style.value)}
              />
            ))}
          </div>
        </div>
        <div className='preview'>
          <h3>
            <span>Preview</span>
            <Button variant='light' size='sm' onClick={() => setBadges({})}>
              Reset
            </Button>
          </h3>
          <div className='badges'>
            {Object.keys(badges).map((badgeName) => (
              <span key={badgeName}>
                <img src={badges[badgeName]} alt={badgeName} />
              </span>
            ))}
          </div>
        </div>
        <div className='markdown'>
          <h3>
            <span>Markdown Code</span>
            <CopyToClipboard text={generateMarkdownPreview()}>
              <Button variant='light' size='sm'>
                Copy Code
              </Button>
            </CopyToClipboard>
          </h3>
          <pre>
            <code>{generateMarkdownPreview()}</code>
          </pre>
        </div>
      </section>
      <footer>
        Made with ❤️ by{' '}
        <a href='https://github.com/sharynneazhar' className='link-light'>
          Sharynne Azhar
        </a>
        .
        <br />
        Inspired by{' '}
        <a
          href='https://github.com/Ileriayo/markdown-badges/tree/master'
          className='link-light'
        >
          ileriayo/markdown-badges
        </a>
      </footer>
    </div>
  );
}

export default App;
