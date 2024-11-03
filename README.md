# Project Title
A mobile app for small contracts from professionals

## Description


## Getting Started

There must be <ins>2 terminals open</ins> to make the project run. The following steps are meant to open the project wanted <br/>
### Step 1:
Duplicate the file called ".envCopy" and rename the duplicated file to ".env". In the ".env" file, the following must be entered:

```
MONGO_URL=mongodb+srv://fixit9337:9zEWh3F3KcdidqcP@clusterfixit.lcsgj.mongodb.net/?retryWrites=true&w=majority&appName=Clusterfixit
JWT_SECRET=ws6UFJEgOxN7wFRe9fCB6c507ELT5Q9O
CLOUDINARY_CLOUD_NAME=dzzjpv5yw
CLOUDINARY_API_KEY=126996845455117
CLOUDINARY_API_SECRET=QHzagCadTLyem0edek0l5X0aEDM
```
**WARNING, the ".env" file must never be pushed to main. EVER.**

<br/><br/>

Step 2 to 4 is always in the same first terminal
### Step 2:
In the first terminal enter the following command:

```
cd server
```

### Step 3:
Still in the same terminal, enter the following command:

```
npm install
```
This is to make sure that nodemon is installed for the project

### Step 4:
Enter the following command:

```
npx nodemon
```
If you see that the terminal output shows: ``` Connected to MongoDB ``` then the server is now operating properly. 

<br/><br/>

Step 5 to 8 is always in the same second terminal
### Step 5:
In the second terminal enter the following command based on which project you would like to open, professional side or client side:
<br/><br/>
Client side:
```
cd fixerClient
```
<br/>

Professional side:

```
cd professionalClient
```

### Step 6:
Still in the same terminal, enter the following command:

```
npm install
```
This is to make sure that all dependencies are installed for the project
<br/><br/>

**PAUSE. DO YOU HAVE EVERYTHING NEEDED?** <br/>
At this point, we assume that you have downloaded the application called "Expo Go" on your personal device AND created a free account. <br/>
![Image 2024-11-01 at 6 12 PM](https://github.com/user-attachments/assets/c634d2fd-03f1-4f11-8bba-7e70d3a9a186)

### Step 7:
For each of the projects, there is a "ipAddress.js" file. In this file there is a single variable that must be updated to make the project work. You must enter the IP address that you are using in this variable. The file should look something like this: 

``` export const IPAddress = 'XXX.XXX.XX.XX'; ```

You must also keep in mind that your phone and computer must be using the same wifi.

### Step 8:
Enter the following command:

```
npx expo start -c
```
This will start the project and output a QR code. Scan this QR code with your phones' camera and it will direct you to the Expo Go application. You should see a loading bar at the bottom of the page. If it does not work on the first try, close the application completely and scan the QR code again. 

**Congrats! You have Fixer Open!**

## Core Features


## Wiki References
- [Home](https://github.com/LachezaraLaz/fixerCapstone/wiki)
- [Diagrams](https://github.com/LachezaraLaz/fixerCapstone/wiki/Diagrams)
- [Meeting Minutes](https://github.com/LachezaraLaz/fixerCapstone/wiki/Meeting-Minutes)
- [Other Documentation](https://github.com/LachezaraLaz/fixerCapstone/wiki/Other-Documentation)
- [Personas](https://github.com/LachezaraLaz/fixerCapstone/wiki/Personas)
- [Risk](https://github.com/LachezaraLaz/fixerCapstone/wiki/Risk)
- [User Stories (Simple List)](https://github.com/LachezaraLaz/fixerCapstone/wiki/User-Stories-(Simple-List))

## Contributors
<table>
  <tr>
    <th>Name</th>
    <th>Student ID</th>
    <th>GitHub Name</th>
  </tr>
  <tr>
    <td>Alexander De Luca</td>
    <td>40209204</td>
    <td><a href ="https://github.com/dlu2002">dlu2002</a></td>
  </tr>
  <tr>
    <td>Anass Sajid</td>
    <td>40158648</td>
    <td><a href="https://github.com/El-Mirrio">El-Mirrio</a></td>
  </tr>
  <tr>
    <td>Facundo Alfaro</td>
    <td>40177429</td>
    <td><a href="https://github.com/Facu-alfaro">facu-alfaro</a></td>
  </tr>
  <tr>
    <td>Karin Sarkis</td>
    <td>40189273</td>
    <td><a href="https://github.com/KarinSarkis">KarinSarkis</a></td>
  </tr>
  <tr>
    <td>Kassem </td>
    <td>40174145</td>
    <td>NvmKassem</td>
  </tr>
  <tr>
    <td>Lachezara Lazarova</td>
    <td>40211033</td>
    <td><a href="https://github.com/LachezaraLaz">LachezaraLaz</a></td>
  </tr>
  <tr>
    <td>Mark Kandaleft</td>
    <td>40126013</td>
    <td><a href="https://github.com/mkandaleft">mkandaleft</a></td>
  </tr>
  <tr>
    <td>Nicola Bdewi</td>
    <td>40161428</td>
    <td><a href="https://github.com/nicola-bdewi">Nicola-Bdewi</a></td>
  </tr>
  <tr>
    <td>Samy Arab</td>
    <td>40209595</td>
    <td><a href="https://github.com/SamyArab">SamyArab</a></td>
  </tr>
  <tr>
    <td>Thaneekan Thankarajah</td>
    <td>40192306</td>
    <td>thaneekan</td>
  </tr>
</table>

## Programming Languages


## License
The application is under the MIT License. See [LICENSE](https://github.com/LachezaraLaz/fixerCapstone/blob/f393faf9eeabf8ae4c7be99b558427e7161d3b41/LICENSE) for more details.
