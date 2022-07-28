### Nõuded
* Python 3.10
* Node.js 18.7.0

### Seadistamine
* Installida vajalikud paketid

  $ pip install -r requirements.txt
  $ npm install

* Käivitada Back-end pool (kaust "server"):
  
  $ python3 main.py

  * Luuakse lokaalne andmebaas (library.db) koos näidisandmetega (raamatud ja admin kasutaja). Kui andmebaas juba eksisteerib, siis seda toimingut teistkordselt ei teostata.
  * Käivitub Flaski server.

* Käivitada Front-end pool (kaust "client"):

    $ yarn start
    
    * Vaikimisi seatud veebibrauseris avaneb rakendus localhost:3000 aadressil, mis on ühtlasi sisselogimise leheks.
    
### Kasutuse võimalused

  * Saab luua kasutajaid (rolliga laenutaja, antud hetkel lahenduse vaade eeldab kommunikatsiooni kasutaja ID-ga 2).
  * Toimib sisse-ja väljalogimine, autentimine ja autoriseerimine.
  * Tabelis kuvatud nuppude põhjal toimub suhtlemine andmebaasiga ehk laenutamise protsess: raamatu kättesaamised ja tagastamised.
  * Võimalik on raamatuid lisada, eemaldada, muuta kogust ja tabelist otsida.
  * Broneeringuid on võimalik tühistada.
  * "Minu konto" vaate all kuvatakse laenutuste arvu (admini puhul kõigi kasutajate peale kokku).
  * Võimalik on seadistada laenutamise tähtaega nädala kaupa suuremaks või väiksemaks, mis on vaikimisi 4 nädalat. 
  * Kui admini poolt kinnitatud raamatu üleandmise kuupäevast alates on laenutamise aeg täis saanud, siis kuvatakse antud raamatu nimi ja autor tabelis beežika tooniga.
  * Kasutajale kuvatakse informatiivseid veateateid.
  * Tegevusi logitakse (logs.log fail).
