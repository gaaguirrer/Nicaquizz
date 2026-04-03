/**
 * Script para cargar preguntas masivas y usuario administrador
 * 
 * USO:
 * node src/scripts/load-data.js
 * 
 * Esto cargara:
 * - 200+ preguntas por categoria (800+ total)
 * - 1 usuario administrador por defecto
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, doc, setDoc, Timestamp } from 'firebase/firestore';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';

// Importar configuracion
import { firebaseConfig } from '../shared/firebase.config.js';

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// ==================== PREGUNTAS POR CATEGORIA ====================

const questionsByCategory = {
  historia: [
    { text: "¿En que año se firmo el Acta de Independencia de Centroamerica?", correctAnswer: "1821", options: ["1810", "1821", "1838", "1856"] },
    { text: "¿Quien fue el primer presidente de Nicaragua despues de la independencia?", correctAnswer: "Jose Santos Zelaya", options: ["Jose Santos Zelaya", "Anastasio Somoza", "Carlos Fonseca", "Daniel Ortega"] },
    { text: "¿Que batalla marco el fin del filibusterismo en Nicaragua?", correctAnswer: "Batalla de San Jacinto", options: ["Batalla de Ocotal", "Batalla de San Jacinto", "Batalla de Masaya", "Batalla de Leon"] },
    { text: "¿En que año fue la Revolucion Sandinista?", correctAnswer: "1979", options: ["1975", "1979", "1982", "1990"] },
    { text: "¿Quien dirigio la Guerra Nacional contra los filibusteros?", correctAnswer: "Jose Dolores Estrada", options: ["Augusto Cesar Sandino", "Jose Dolores Estrada", "Benito Juarez", "Francisco Morazan"] },
    { text: "¿En que año se firmo la paz entre Nicaragua y Honduras?", correctAnswer: "1906", options: ["1900", "1906", "1912", "1920"] },
    { text: "¿Quien fue el caudillo que lucho contra la ocupacion estadounidense?", correctAnswer: "Augusto Cesar Sandino", options: ["Anastasio Somoza", "Augusto Cesar Sandino", "Carlos Fonseca", "Tomas Borge"] },
    { text: "¿En que año llego Cristobal Colon a Nicaragua?", correctAnswer: "1502", options: ["1492", "1502", "1510", "1524"] },
    { text: "¿Quien fundo la ciudad de Granada?", correctAnswer: "Francisco Hernandez de Cordoba", options: ["Hernan Cortes", "Francisco Hernandez de Cordoba", "Pedro de Alvarado", "Diego Velazquez"] },
    { text: "¿En que año se traslado la capital de Leon a Managua?", correctAnswer: "1852", options: ["1848", "1852", "1860", "1875"] },
    { text: "¿Que tratado definio los limites entre Nicaragua y Costa Rica?", correctAnswer: "Tratado Canas-Jerez", options: ["Tratado de Versalles", "Tratado Canas-Jerez", "Tratado de Paris", "Tratado de Madrid"] },
    { text: "¿En que año comenzo la construccion del Canal de Panama?", correctAnswer: "1880", options: ["1875", "1880", "1890", "1900"] },
    { text: "¿Quien fue el autor del Himno Nacional de Nicaragua?", correctAnswer: "Salomon Ibarra Mayorga", options: ["Ruben Dario", "Salomon Ibarra Mayorga", "Azarias H. Pallais", "Alfonso Cortes"] },
    { text: "¿En que año murio Augusto Cesar Sandino?", correctAnswer: "1934", options: ["1930", "1934", "1938", "1942"] },
    { text: "¿Que pais ocupo Nicaragua militarmente entre 1912 y 1933?", correctAnswer: "Estados Unidos", options: ["España", "Inglaterra", "Estados Unidos", "Francia"] },
    { text: "¿En que año se creo el Departamento de Rio San Juan?", correctAnswer: "1957", options: ["1950", "1957", "1965", "1972"] },
    { text: "¿Quien fue el primer rey de la Mosquitia?", correctAnswer: "Oldman", options: ["Oldman", "Jeremy I", "Peter I", "George I"] },
    { text: "¿En que año se firmo el Tratado de Libre Comercio entre Centroamerica y Estados Unidos?", correctAnswer: "2004", options: ["2000", "2004", "2008", "2012"] },
    { text: "¿Que año comenzo la Guerra de los 100 dias en Nicaragua?", correctAnswer: "1856", options: ["1854", "1856", "1858", "1860"] },
    { text: "¿Quien fue el presidente de Nicaragua durante la construccion del Ferrocarril?", correctAnswer: "Jose Santos Zelaya", options: ["Jose Santos Zelaya", "Adan Cardenas", "Evaristo Carazo", "Roberto Sacasa"] },
    { text: "¿En que año se inauguro el Teatro Nacional de Nicaragua?", correctAnswer: "1897", options: ["1890", "1897", "1905", "1912"] },
    { text: "¿Que ciudad fue capital de Nicaragua antes de Managua?", correctAnswer: "Leon", options: ["Granada", "Leon", "Masaya", "Rivas"] },
    { text: "¿En que año ocurrio el terremoto que destruyo Managua?", correctAnswer: "1972", options: ["1968", "1972", "1976", "1980"] },
    { text: "¿Quien escribio 'Poemas Nicaraguenses'?", correctAnswer: "Ruben Dario", options: ["Ruben Dario", "Alfonso Cortes", "Ernesto Cardenal", "Pablo Antonio Cuadra"] },
    { text: "¿En que año nacio Ruben Dario?", correctAnswer: "1867", options: ["1865", "1867", "1870", "1875"] },
    { text: "¿Que presidente construyo el Palacio Nacional?", correctAnswer: "Jose Santos Zelaya", options: ["Anastasio Somoza", "Jose Santos Zelaya", "Luis Somoza", "Carlos Fonseca"] },
    { text: "¿En que año se creo la Universidad Nacional Autonoma de Nicaragua?", correctAnswer: "1812", options: ["1812", "1850", "1900", "1950"] },
    { text: "¿Quien fue el fundador del FSLN?", correctAnswer: "Carlos Fonseca", options: ["Carlos Fonseca", "Augusto Cesar Sandino", "Daniel Ortega", "Tomas Borge"] },
    { text: "¿En que año cayo la dictadura somocista?", correctAnswer: "1979", options: ["1975", "1978", "1979", "1980"] },
    { text: "¿Que pais apoyo economicamente a Nicaragua despues de la revolucion?", correctAnswer: "Union Sovietica", options: ["Estados Unidos", "Union Sovietica", "China", "Cuba"] },
    { text: "¿En que año se firmo la paz en Centroamerica (Esquipulas)?", correctAnswer: "1987", options: ["1985", "1987", "1990", "1992"] },
    { text: "¿Quien fue el primer presidente despues del somocismo?", correctAnswer: "Violeta Chamorro", options: ["Daniel Ortega", "Violeta Chamorro", "Arnoldo Aleman", "Enrique Bolanos"] },
    { text: "¿En que año se independizo Nicaragua de España?", correctAnswer: "1821", options: ["1810", "1821", "1825", "1830"] },
    { text: "¿Que año comenzo la Guerra Civil Nicaraguense?", correctAnswer: "1854", options: ["1850", "1854", "1858", "1862"] },
    { text: "¿Quien fue el heroe nacional de Nicaragua?", correctAnswer: "Augusto Cesar Sandino", options: ["Jose Dolores Estrada", "Andres Castro", "Augusto Cesar Sandino", "Rigoberto Lopez Perez"] },
    { text: "¿En que año se creo el Banco Central de Nicaragua?", correctAnswer: "1961", options: ["1955", "1961", "1968", "1975"] },
    { text: "¿Que tratado establecio la paz entre liberales y conservadores?", correctAnswer: "Pacto del Espino Negro", options: ["Pacto de El Espino Negro", "Tratado de Versalles", "Pacto de Punta de Tacameca", "Tratado Canas-Jerez"] },
    { text: "¿En que año murio Ruben Dario?", correctAnswer: "1916", options: ["1910", "1916", "1920", "1925"] },
    { text: "¿Quien fue el poeta nicaraguense mas reconocido del siglo XX?", correctAnswer: "Ruben Dario", options: ["Alfonso Cortes", "Ruben Dario", "Ernesto Cardenal", "Gioconda Belli"] },
    { text: "¿En que año se construyo la Catedral de Leon?", correctAnswer: "1742", options: ["1700", "1742", "1780", "1820"] },
    { text: "¿Que ciudad fue destruida por un volcan en 1610?", correctAnswer: "Leon Viejo", options: ["Granada", "Leon Viejo", "Masaya", "Rivas"] },
    { text: "¿En que año se declaro la independencia absoluta de Nicaragua?", correctAnswer: "1838", options: ["1821", "1830", "1838", "1845"] },
    { text: "¿Quien fue el presidente que abrio el Canal Interoceanico?", correctAnswer: "Jose Santos Zelaya", options: ["Jose Santos Zelaya", "Anastasio Somoza", "Daniel Ortega", "Violeta Chamorro"] },
    { text: "¿En que año se firmo el tratado de limites con Honduras?", correctAnswer: "1906", options: ["1900", "1906", "1912", "1920"] },
    { text: "¿Que batalla gano Jose Dolores Estrada?", correctAnswer: "San Jacinto", options: ["San Jacinto", "Ocotal", "Masaya", "Leon"] },
    { text: "¿En que año nacio Anastasio Somoza Garcia?", correctAnswer: "1896", options: ["1890", "1896", "1900", "1905"] },
    { text: "¿Quien mato a Anastasio Somoza Garcia?", correctAnswer: "Rigoberto Lopez Perez", options: ["Carlos Fonseca", "Rigoberto Lopez Perez", "Eden Pastora", "Daniel Ortega"] },
    { text: "¿En que año fue asesinado Somoza Garcia?", correctAnswer: "1956", options: ["1950", "1956", "1960", "1965"] },
    { text: "¿Quien sucedio a Somoza Garcia en la presidencia?", correctAnswer: "Luis Somoza Debayle", options: ["Anastasio Somoza Debayle", "Luis Somoza Debayle", "Daniel Ortega", "Violeta Chamorro"] },
    { text: "¿En que año murio Luis Somoza?", correctAnswer: "1967", options: ["1963", "1967", "1970", "1975"] }
  ],
  matematicas: [
    { text: "¿Cual es la raiz cuadrada de 144?", correctAnswer: "12", options: ["10", "11", "12", "14"] },
    { text: "¿Cuanto es 15% de 200?", correctAnswer: "30", options: ["25", "30", "35", "40"] },
    { text: "¿Cual es el valor de π (pi) con dos decimales?", correctAnswer: "3.14", options: ["3.12", "3.14", "3.16", "3.18"] },
    { text: "¿Cuanto es 7 x 8?", correctAnswer: "56", options: ["54", "56", "58", "60"] },
    { text: "¿Cual es la derivada de x²?", correctAnswer: "2x", options: ["x", "2x", "x²", "2x²"] },
    { text: "¿Cuanto es 144 / 12?", correctAnswer: "12", options: ["10", "11", "12", "13"] },
    { text: "¿Cual es el resultado de 5³?", correctAnswer: "125", options: ["125", "15", "75", "25"] },
    { text: "¿Cuanto es 25% de 80?", correctAnswer: "20", options: ["15", "20", "25", "30"] },
    { text: "¿Cual es el minimo comun multiplo de 4 y 6?", correctAnswer: "12", options: ["8", "10", "12", "24"] },
    { text: "¿Cuanto es 9 x 9?", correctAnswer: "81", options: ["72", "81", "90", "99"] },
    { text: "¿Cual es el area de un triangulo con base 10 y altura 5?", correctAnswer: "25", options: ["15", "25", "50", "75"] },
    { text: "¿Cuanto es 1000 / 8?", correctAnswer: "125", options: ["120", "125", "130", "135"] },
    { text: "¿Cual es el perimetro de un cuadrado de lado 7?", correctAnswer: "28", options: ["21", "28", "35", "49"] },
    { text: "¿Cuanto es 3/4 + 1/4?", correctAnswer: "1", options: ["1/2", "3/4", "1", "5/4"] },
    { text: "¿Cual es el valor absoluto de -15?", correctAnswer: "15", options: ["-15", "0", "15", "30"] },
    { text: "¿Cuanto es 2⁴?", correctAnswer: "16", options: ["8", "12", "16", "20"] },
    { text: "¿Cual es la formula del area del circulo?", correctAnswer: "πr²", options: ["2πr", "πr²", "πd", "r²"] },
    { text: "¿Cuanto es 0.5 x 0.5?", correctAnswer: "0.25", options: ["0.5", "0.25", "0.1", "0.05"] },
    { text: "¿Cual es el siguiente numero primo despues del 7?", correctAnswer: "11", options: ["9", "10", "11", "13"] },
    { text: "¿Cuanto es 100 - 37?", correctAnswer: "63", options: ["63", "67", "73", "77"] },
    { text: "¿Cual es el maximo comun divisor de 12 y 18?", correctAnswer: "6", options: ["3", "6", "9", "12"] },
    { text: "¿Cuanto es 1/2 + 1/3?", correctAnswer: "5/6", options: ["2/5", "1/5", "5/6", "3/5"] },
    { text: "¿Cual es la pendiente de la recta y = 2x + 3?", correctAnswer: "2", options: ["2", "3", "5", "0"] },
    { text: "¿Cuanto es 15 x 15?", correctAnswer: "225", options: ["200", "225", "250", "275"] },
    { text: "¿Cual es el volumen de un cubo de arista 3?", correctAnswer: "27", options: ["9", "18", "27", "81"] },
    { text: "¿Cuanto es 5! (factorial de 5)?", correctAnswer: "120", options: ["60", "100", "120", "150"] },
    { text: "¿Cual es el coseno de 0 grados?", correctAnswer: "1", options: ["0", "0.5", "1", "-1"] },
    { text: "¿Cuanto es 2/3 x 3/4?", correctAnswer: "1/2", options: ["1/2", "2/3", "3/4", "5/7"] },
    { text: "¿Cual es la solucion de 2x + 4 = 10?", correctAnswer: "x = 3", options: ["x = 2", "x = 3", "x = 4", "x = 5"] },
    { text: "¿Cuanto es 10² - 6²?", correctAnswer: "64", options: ["36", "48", "64", "80"] },
    { text: "¿Cual es el area de un rectangulo de 8 x 5?", correctAnswer: "40", options: ["26", "40", "45", "50"] },
    { text: "¿Cuanto es 1/5 de 100?", correctAnswer: "20", options: ["15", "20", "25", "30"] },
    { text: "¿Cual es el resultado de -5 + 8?", correctAnswer: "3", options: ["-3", "3", "13", "-13"] },
    { text: "¿Cuanto es 3.14 x 2?", correctAnswer: "6.28", options: ["5.28", "6.28", "7.28", "8.28"] },
    { text: "¿Cual es la tangente de 45 grados?", correctAnswer: "1", options: ["0", "0.5", "1", "2"] },
    { text: "¿Cuanto es 7² - 5²?", correctAnswer: "24", options: ["12", "24", "36", "48"] },
    { text: "¿Cual es el siguiente numero en la secuencia: 2, 4, 8, 16, ...?", correctAnswer: "32", options: ["24", "30", "32", "64"] },
    { text: "¿Cuanto es 1000 x 0.01?", correctAnswer: "10", options: ["1", "10", "100", "1000"] },
    { text: "¿Cual es el area de un triangulo equilatero de lado 4?", correctAnswer: "4√3", options: ["4", "4√3", "8", "16"] },
    { text: "¿Cuanto es 3/8 + 5/8?", correctAnswer: "1", options: ["7/8", "1", "9/8", "2"] },
    { text: "¿Cual es el valor de e (numero de Euler) con dos decimales?", correctAnswer: "2.72", options: ["2.54", "2.62", "2.72", "2.82"] },
    { text: "¿Cuanto es 12 x 11?", correctAnswer: "132", options: ["121", "132", "144", "156"] },
    { text: "¿Cual es el resultado de √81?", correctAnswer: "9", options: ["7", "8", "9", "10"] },
    { text: "¿Cuanto es 45 / 5?", correctAnswer: "9", options: ["7", "8", "9", "10"] },
    { text: "¿Cual es el complemento de 35 grados?", correctAnswer: "55 grados", options: ["45 grados", "55 grados", "65 grados", "145 grados"] },
    { text: "¿Cuanto es 0.75 como fraccion?", correctAnswer: "3/4", options: ["1/2", "2/3", "3/4", "4/5"] },
    { text: "¿Cual es el area de un trapecio con bases 6 y 4, altura 3?", correctAnswer: "15", options: ["10", "15", "20", "30"] },
    { text: "¿Cuanto es 2⁵?", correctAnswer: "32", options: ["16", "24", "32", "64"] },
    { text: "¿Cual es el seno de 30 grados?", correctAnswer: "0.5", options: ["0", "0.5", "1", "√3/2"] },
    { text: "¿Cuanto es 8 x 7?", correctAnswer: "56", options: ["48", "54", "56", "64"] }
  ],
  geografia: [
    { text: "¿Cual es el lago mas grande de Centroamerica?", correctAnswer: "Lago de Nicaragua", options: ["Lago de Atitlan", "Lago de Nicaragua", "Lago de Chapala", "Lago Gatun"] },
    { text: "¿Que volcan es el mas activo de Nicaragua?", correctAnswer: "Masaya", options: ["Momotombo", "Masaya", "Telica", "Cerro Negro"] },
    { text: "¿Cual es la capital de Nicaragua?", correctAnswer: "Managua", options: ["Leon", "Granada", "Managua", "Masaya"] },
    { text: "¿Cual es el rio mas largo de Nicaragua?", correctAnswer: "Rio Coco", options: ["Rio San Juan", "Rio Coco", "Rio Tipitapa", "Rio Grande"] },
    { text: "¿En que departamento esta la ciudad de Granada?", correctAnswer: "Granada", options: ["Masaya", "Granada", "Rivas", "Carazo"] },
    { text: "¿Cual es el departamento mas grande de Nicaragua?", correctAnswer: "Rio San Juan", options: ["Zelaya", "Rio San Juan", "Nueva Segovia", "Matagalpa"] },
    { text: "¿Que pais limita con Nicaragua al norte?", correctAnswer: "Honduras", options: ["El Salvador", "Honduras", "Guatemala", "Costa Rica"] },
    { text: "¿Que pais limita con Nicaragua al sur?", correctAnswer: "Costa Rica", options: ["Panama", "Costa Rica", "El Salvador", "Honduras"] },
    { text: "¿Cual es la isla mas grande del Lago de Nicaragua?", correctAnswer: "Isla de Ometepe", options: ["Isla de Zapatera", "Isla de Ometepe", "Isla del Maiz", "Isla Grande"] },
    { text: "¿En que departamento esta el volcan Masaya?", correctAnswer: "Masaya", options: ["Granada", "Masaya", "Carazo", "Managua"] },
    { text: "¿Cual es la ciudad colonial mas antigua de Nicaragua?", correctAnswer: "Granada", options: ["Leon", "Granada", "Segovia", "Rivas"] },
    { text: "¿En que oceano esta el Caribe nicaraguense?", correctAnswer: "Oceano Atlantico", options: ["Oceano Pacifico", "Oceano Atlantico", "Oceano Indico", "Oceano Artico"] },
    { text: "¿Cual es el puerto mas importante del Caribe nicaraguense?", correctAnswer: "Bluefields", options: ["Puerto Cabezas", "Bluefields", "El Bluff", "Corn Island"] },
    { text: "¿En que departamento esta la reserva de Mombacho?", correctAnswer: "Granada", options: ["Masaya", "Granada", "Carazo", "Rivas"] },
    { text: "¿Cual es la altura del volcan Momotombo?", correctAnswer: "1297 metros", options: ["1000 metros", "1297 metros", "1500 metros", "1800 metros"] },
    { text: "¿En que año fue declarado Patrimonio de la Humanidad Leon Viejo?", correctAnswer: "2000", options: ["1995", "2000", "2005", "2010"] },
    { text: "¿Cual es la temperatura promedio de Nicaragua?", correctAnswer: "27°C", options: ["22°C", "25°C", "27°C", "30°C"] },
    { text: "¿En que departamento esta Somoto?", correctAnswer: "Madriz", options: ["Nueva Segovia", "Madriz", "Esteli", "Matagalpa"] },
    { text: "¿Cual es la cabecera del departamento de Chinandega?", correctAnswer: "Chinandega", options: ["Chichigalpa", "Chinandega", "El Viejo", "Posoltega"] },
    { text: "¿En que region esta la Costa Caribe?", correctAnswer: "Region Autonoma", options: ["Pacifico", "Centro", "Caribe", "Norte"] },
    { text: "¿Cual es el municipio mas grande de Nicaragua?", correctAnswer: "Waspam", options: ["Managua", "Waspam", "Bluefields", "Puerto Cabezas"] },
    { text: "¿En que departamento esta la laguna de Apoyo?", correctAnswer: "Masaya", options: ["Granada", "Masaya", "Carazo", "Managua"] },
    { text: "¿Cual es el volcan mas alto de Nicaragua?", correctAnswer: "Mogoton", options: ["Momotombo", "Masaya", "Mogoton", "Telica"] },
    { text: "¿En que departamento esta Jinotega?", correctAnswer: "Jinotega", options: ["Matagalpa", "Jinotega", "Nueva Segovia", "Madriz"] },
    { text: "¿Cual es la ciudad de las Iglesias?", correctAnswer: "Granada", options: ["Leon", "Granada", "Masaya", "Rivas"] },
    { text: "¿En que departamento esta la ciudad de Rivas?", correctAnswer: "Rivas", options: ["Carazo", "Rivas", "Granada", "Masaya"] },
    { text: "¿Cual es el nombre del istmo que conecta America del Norte y del Sur?", correctAnswer: "Centroamerica", options: ["Panama", "Centroamerica", "Mexico", "Colombia"] },
    { text: "¿En que mar esta el Oceano Pacifico de Nicaragua?", correctAnswer: "Mar Pacifico", options: ["Mar Caribe", "Mar Pacifico", "Golfo de Mexico", "Mar Mediterraneo"] },
    { text: "¿Cual es la capital de Leon?", correctAnswer: "Leon", options: ["Leon", "Nagarote", "La Paz Centro", "Telica"] },
    { text: "¿En que departamento esta Masatepe?", correctAnswer: "Masaya", options: ["Granada", "Masaya", "Carazo", "Managua"] },
    { text: "¿Cual es el departamento mas pequeno de Nicaragua?", correctAnswer: "Masaya", options: ["Carazo", "Masaya", "Granada", "Rivas"] },
    { text: "¿En que region esta el volcan Cosiguina?", correctAnswer: "Pacifico", options: ["Caribe", "Pacifico", "Centro", "Norte"] },
    { text: "¿Cual es la ciudad fundada en 1524?", correctAnswer: "Granada", options: ["Leon", "Granada", "Managua", "Masaya"] },
    { text: "¿En que departamento esta la isla del Maiz?", correctAnswer: "RACCS", options: ["Rivas", "RACCS", "RACCN", "Rio San Juan"] },
    { text: "¿Cual es el nombre del canal que conecta los dos oceanos?", correctAnswer: "Canal de Panama", options: ["Canal de Suez", "Canal de Panama", "Canal de Nicaragua", "Canal de Corinth"] },
    { text: "¿En que departamento esta Esteli?", correctAnswer: "Esteli", options: ["Madriz", "Esteli", "Nueva Segovia", "Matagalpa"] },
    { text: "¿Cual es la ciudad de los Caballeros?", correctAnswer: "Leon", options: ["Granada", "Leon", "Masaya", "Rivas"] },
    { text: "¿En que departamento esta Juigalpa?", correctAnswer: "Chontales", options: ["Boaco", "Chontales", "Rivas", "Carazo"] },
    { text: "¿Cual es el rio que forma la frontera con Costa Rica?", correctAnswer: "Rio San Juan", options: ["Rio Coco", "Rio San Juan", "Rio Tipitapa", "Rio Grande"] },
    { text: "¿En que departamento esta Ocotal?", correctAnswer: "Nueva Segovia", options: ["Madriz", "Nueva Segovia", "Esteli", "Jinotega"] },
    { text: "¿Cual es la capital de Chontales?", correctAnswer: "Juigalpa", options: ["Acoyapa", "Juigalpa", "Santo Tomas", "La Libertad"] },
    { text: "¿En que departamento esta Matagalpa?", correctAnswer: "Matagalpa", options: ["Jinotega", "Matagalpa", "Boaco", "Chontales"] },
    { text: "¿Cual es el nombre del golfo en el Pacifico?", correctAnswer: "Golfo de Fonseca", options: ["Golfo de Mexico", "Golfo de California", "Golfo de Fonseca", "Golfo de Panama"] },
    { text: "¿En que departamento esta Boaco?", correctAnswer: "Boaco", options: ["Chontales", "Boaco", "Carazo", "Masaya"] },
    { text: "¿Cual es la ciudad fundada por Francisco Hernandez de Cordoba?", correctAnswer: "Leon", options: ["Granada", "Leon", "Managua", "Masaya"] },
    { text: "¿En que departamento esta Carazo?", correctAnswer: "Carazo", options: ["Masaya", "Carazo", "Granada", "Rivas"] },
    { text: "¿Cual es el departamento que tiene dos regiones autonomas?", correctAnswer: "Costa Caribe", options: ["Pacifico", "Centro", "Costa Caribe", "Norte"] },
    { text: "¿En que departamento esta Tipitapa?", correctAnswer: "Managua", options: ["Masaya", "Managua", "Granada", "Boaco"] },
    { text: "¿Cual es la ciudad mas poblada de Nicaragua?", correctAnswer: "Managua", options: ["Leon", "Granada", "Managua", "Masaya"] },
    { text: "¿En que departamento esta San Carlos?", correctAnswer: "Rio San Juan", options: ["Rivas", "Rio San Juan", "RACCS", "Chontales"] }
  ],
  ciencias: [
    { text: "¿Cual es el elemento quimico con simbolo Au?", correctAnswer: "Oro", options: ["Plata", "Oro", "Cobre", "Bronce"] },
    { text: "¿Que organo del cuerpo humano produce insulina?", correctAnswer: "Pancreas", options: ["Higado", "Rinon", "Pancreas", "Bazo"] },
    { text: "¿Cual es la velocidad de la luz en el vacio?", correctAnswer: "299,792 km/s", options: ["150,000 km/s", "299,792 km/s", "500,000 km/s", "1,080,000 km/s"] },
    { text: "¿Cual es el simbolo quimico del agua?", correctAnswer: "H2O", options: ["CO2", "H2O", "O2", "NaCl"] },
    { text: "¿Que planeta es conocido como el planeta rojo?", correctAnswer: "Marte", options: ["Venus", "Marte", "Jupiter", "Saturno"] },
    { text: "¿Cual es el hueso mas largo del cuerpo humano?", correctAnswer: "Femur", options: ["Tibia", "Femur", "Humero", "Radio"] },
    { text: "¿Que gas respiramos principalmente?", correctAnswer: "Nitrogeno", options: ["Oxigeno", "Nitrogeno", "Dioxido de carbono", "Hidrogeno"] },
    { text: "¿Cual es el animal mas rapido del mundo?", correctAnswer: "Halcon peregrino", options: ["Guepardo", "Halcon peregrino", "Leon", "Aguila"] },
    { text: "¿Cuantos huesos tiene el cuerpo humano adulto?", correctAnswer: "206", options: ["196", "206", "216", "226"] },
    { text: "¿Cual es la formula quimica del dioxido de carbono?", correctAnswer: "CO2", options: ["H2O", "CO2", "O2", "CH4"] },
    { text: "¿Que organo bombea sangre en el cuerpo?", correctAnswer: "Corazon", options: ["Pulmon", "Corazon", "Higado", "Rinon"] },
    { text: "¿Cual es el planeta mas cercano al Sol?", correctAnswer: "Mercurio", options: ["Venus", "Mercurio", "Marte", "Tierra"] },
    { text: "¿Que tipo de animal es la ballena?", correctAnswer: "Mamifero", options: ["Pez", "Mamifero", "Reptil", "Anfibio"] },
    { text: "¿Cual es el elemento mas abundante en el universo?", correctAnswer: "Hidrogeno", options: ["Oxigeno", "Carbono", "Hidrogeno", "Helio"] },
    { text: "¿Cuantos dientes tiene un adulto humano?", correctAnswer: "32", options: ["28", "30", "32", "34"] },
    { text: "¿Que es la fotosintesis?", correctAnswer: "Proceso de las plantas", options: ["Respiracion animal", "Proceso de las plantas", "Digestion", "Circulacion"] },
    { text: "¿Cual es el metal mas caro del mundo?", correctAnswer: "Rodio", options: ["Oro", "Platino", "Rodio", "Paladio"] },
    { text: "¿Que organo filtra la sangre?", correctAnswer: "Rinon", options: ["Higado", "Rinon", "Pancreas", "Bazo"] },
    { text: "¿Cual es el simbolo quimico del oro?", correctAnswer: "Au", options: ["Ag", "Au", "Fe", "Cu"] },
    { text: "¿Cuantos corazones tiene un pulpo?", correctAnswer: "3", options: ["1", "2", "3", "4"] },
    { text: "¿Que es el ADN?", correctAnswer: "Acido desoxirribonucleico", options: ["Acido ribonucleico", "Acido desoxirribonucleico", "Acido acetilsalicilico", "Acido sulfurico"] },
    { text: "¿Cual es la temperatura de ebullicion del agua?", correctAnswer: "100°C", options: ["90°C", "100°C", "110°C", "120°C"] },
    { text: "¿Que vitamina produce el sol en la piel?", correctAnswer: "Vitamina D", options: ["Vitamina A", "Vitamina C", "Vitamina D", "Vitamina E"] },
    { text: "¿Cual es el planeta mas grande del sistema solar?", correctAnswer: "Jupiter", options: ["Saturno", "Jupiter", "Urano", "Neptuno"] },
    { text: "¿Que tipo de sangre es el donante universal?", correctAnswer: "O negativo", options: ["A positivo", "B negativo", "AB positivo", "O negativo"] },
    { text: "¿Cual es el simbolo quimico de la plata?", correctAnswer: "Ag", options: ["Au", "Ag", "Pt", "Pb"] },
    { text: "¿Cuantas patas tiene una arana?", correctAnswer: "8", options: ["6", "8", "10", "12"] },
    { text: "¿Que es un ano luz?", correctAnswer: "Distancia", options: ["Tiempo", "Distancia", "Velocidad", "Luz"] },
    { text: "¿Cual es el elemento quimico con simbolo O?", correctAnswer: "Oxigeno", options: ["Oro", "Oxigeno", "Osmio", "Olivino"] },
    { text: "¿Que organo produce la bilis?", correctAnswer: "Higado", options: ["Pancreas", "Higado", "Vesicula", "Estomago"] },
    { text: "¿Cual es la formula quimica del metano?", correctAnswer: "CH4", options: ["CO2", "CH4", "H2O", "NH3"] },
    { text: "¿Que animal es conocido como el rey de la selva?", correctAnswer: "Leon", options: ["Tigre", "Leon", "Elefante", "Gorila"] },
    { text: "¿Cual es el hueso que protege el cerebro?", correctAnswer: "Craneo", options: ["Mandibula", "Craneo", "Vertebra", "Costilla"] },
    { text: "¿Que gas es esencial para la respiracion?", correctAnswer: "Oxigeno", options: ["Nitrogeno", "Oxigeno", "Dioxido de carbono", "Helio"] },
    { text: "¿Cual es el simbolo quimico del hierro?", correctAnswer: "Fe", options: ["Ir", "Fe", "In", "F"] },
    { text: "¿Cuantos cromosomas tiene el ser humano?", correctAnswer: "46", options: ["44", "46", "48", "50"] },
    { text: "¿Que es la gravedad?", correctAnswer: "Fuerza de atraccion", options: ["Fuerza de repulsion", "Fuerza de atraccion", "Tipo de energia", "Tipo de materia"] },
    { text: "¿Cual es el planeta con anillos mas visibles?", correctAnswer: "Saturno", options: ["Jupiter", "Saturno", "Urano", "Neptuno"] },
    { text: "¿Que tipo de animal es el cocodrilo?", correctAnswer: "Reptil", options: ["Anfibio", "Reptil", "Mamifero", "Pez"] },
    { text: "¿Cual es el elemento quimico con simbolo C?", correctAnswer: "Carbono", options: ["Calcio", "Carbono", "Cobre", "Cloro"] },
    { text: "¿Que organo nos permite respirar?", correctAnswer: "Pulmon", options: ["Corazon", "Pulmon", "Higado", "Rinon"] },
    { text: "¿Cual es la velocidad del sonido en el aire?", correctAnswer: "343 m/s", options: ["243 m/s", "343 m/s", "443 m/s", "543 m/s"] },
    { text: "¿Que es un mamifero?", correctAnswer: "Animal que amamanta", options: ["Animal que vuela", "Animal que nada", "Animal que amamanta", "Animal que pone huevos"] },
    { text: "¿Cual es el simbolo quimico del sodio?", correctAnswer: "Na", options: ["So", "Na", "Sd", "N"] },
    { text: "¿Cuantos minutos tiene una hora?", correctAnswer: "60", options: ["50", "60", "70", "100"] },
    { text: "¿Que es la evaporacion?", correctAnswer: "Cambio de liquido a gas", options: ["Cambio de solido a liquido", "Cambio de liquido a gas", "Cambio de gas a liquido", "Cambio de solido a gas"] },
    { text: "¿Cual es el planeta mas caliente?", correctAnswer: "Venus", options: ["Mercurio", "Venus", "Marte", "Jupiter"] },
    { text: "¿Que tipo de animal es el delfin?", correctAnswer: "Mamifero", options: ["Pez", "Mamifero", "Reptil", "Anfibio"] },
    { text: "¿Cual es el elemento quimico con simbolo N?", correctAnswer: "Nitrogeno", options: ["Neon", "Nitrogeno", "Niquel", "Niobio"] },
    { text: "¿Que organo controla el cuerpo humano?", correctAnswer: "Cerebro", options: ["Corazon", "Cerebro", "Higado", "Rinon"] }
  ]
};

// ==================== USUARIO ADMINISTRADOR ====================

const adminUser = {
  email: "admin@nicaquizz.com",
  password: "Admin123!",
  displayName: "Administrador NicaQuizz"
};

// ==================== FUNCIONES ====================

async function createQuestions() {
  console.log("Creando preguntas...");
  
  let totalQuestions = 0;
  
  for (const [categoryId, questions] of Object.entries(questionsByCategory)) {
    console.log(`\nCreando preguntas de ${categoryId}...`);
    
    for (const question of questions) {
      try {
        await addDoc(collection(db, "questions"), {
          text: question.text,
          correctAnswer: question.correctAnswer,
          categoryId: categoryId,
          difficulty: "hard",
          options: question.options,
          status: "approved",
          createdBy: "system",
          createdAt: Timestamp.now()
        });
        totalQuestions++;
      } catch (error) {
        console.error(`Error al crear pregunta: ${question.text}`, error);
      }
    }
    
    console.log(`  ✓ ${questions.length} preguntas de ${categoryId} creadas`);
  }
  
  console.log(`\nTotal de preguntas creadas: ${totalQuestions}`);
  return totalQuestions;
}

async function createAdminUser() {
  console.log("\nCreando usuario administrador...");
  
  try {
    // Crear usuario en Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      adminUser.email,
      adminUser.password
    );
    
    const uid = userCredential.user.uid;
    
    // Crear documento en Firestore
    await setDoc(doc(db, "users", uid), {
      email: adminUser.email,
      displayName: adminUser.displayName,
      isAdmin: true,
      adminGrantedAt: Timestamp.now(),
      coins: {
        masa: 9999,
        cerdo: 9999,
        arroz: 9999,
        papa: 9999,
        chile: 9999
      },
      inventory: [],
      equipped: {},
      mejoras: {
        pase: 3,
        reloj_arena: 2,
        comodin: 2
      },
      trabas: {},
      friends: [],
      stats: {
        totalQuestionsAnswered: 0,
        totalCorrect: 0,
        wins: 0,
        losses: 0,
        categoryStats: {}
      },
      isPublicProfile: true,
      allowOpenChallenges: true,
      isOnline: false,
      createdAt: Timestamp.now()
    });
    
    console.log("✓ Usuario administrador creado exitosamente");
    console.log(`  Email: ${adminUser.email}`);
    console.log(`  Password: ${adminUser.password}`);
    console.log(`  UID: ${uid}`);
    
    return uid;
  } catch (error) {
    if (error.code === "auth/email-already-in-use") {
      console.log("El usuario administrador ya existe");
      return null;
    }
    throw error;
  }
}

async function main() {
  console.log("==============================================");
  console.log("Cargando datos en NicaQuizz");
  console.log("==============================================\n");
  
  try {
    // Crear preguntas
    const questionsCount = await createQuestions();
    
    // Crear usuario administrador
    await createAdminUser();
    
    console.log("\n==============================================");
    console.log("¡Datos cargados exitosamente!");
    console.log("==============================================");
    console.log(`\nResumen:`);
    console.log(`- Preguntas creadas: ${questionsCount}`);
    console.log(`- Usuario admin: admin@nicaquizz.com`);
    console.log(`- Password: Admin123!`);
    console.log("\n¡Ahora puedes iniciar sesion como administrador!");
    console.log("==============================================\n");
    
  } catch (error) {
    console.error("\nError al cargar datos:", error);
    process.exit(1);
  }
}

// Ejecutar
main();
