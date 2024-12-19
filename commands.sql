CREATE TABLE blogs (
    id SERIAL PRIMARY KEY,
    author text,
    url text NOT NULL,
    title text NOT NULL,
    likes integer DEFAULT 0
);

INSERT INTO blogs (author, url, title)
VALUES ('Teppo Testinen', 'www.esmes.com', 'Testiblogi1');

INSERT INTO blogs (author, url, title)
VALUES ('Seppo Testinen', 'www.feikki.fi', 'Testiblogi2');

INSERT INTO blogs (author, url, title)
VALUES ('Keppo Testinen', 'www.osoite.org', 'Testiblogi3');