let isRoot = false;
let users = JSON.parse(localStorage.getItem('users')) || { 'user': '12345' };
let currentUser = 'user';
let currentDir = '~';
let authenticated = false;
let promptElement = document.getElementById('prompt');
let outputElement = document.getElementById('output');
let inputElement = document.getElementById('input');

const rootDirectories = {
    '/': ['bin', 'boot', 'dev', 'etc', 'home', 'lib', 'lib64', 'media', 'mnt', 'opt', 'proc', 'root', 'run', 'sbin', 'srv', 'sys', 'tmp', 'usr', 'var'],
};

const homeDirectories = ['Documents', 'Downloads', 'Music', 'Pictures', 'Videos'];

function initializeFilesystem() {
    if (!localStorage.getItem('filesystem')) {
        const filesystem = {
            '/': rootDirectories['/'],
            '/home': {},
        };

        for (let user in users) {
            if (user !== 'root') {
                filesystem[`/home/${user}`] = homeDirectories;
                homeDirectories.forEach(dir => {
                    filesystem[`/home/${user}/${dir}`] = [];
                });
            }
        }
        localStorage.setItem('filesystem', JSON.stringify(filesystem));
    } else {
        const filesystem = JSON.parse(localStorage.getItem('filesystem'));
        for (let dir in rootDirectories) {
            if (!filesystem[dir]) {
                filesystem[dir] = rootDirectories[dir];
            }
        }
        localStorage.setItem('filesystem', JSON.stringify(filesystem));
    }
}

function getCurrentPath() {
    if (currentDir === '~') {
        return `/home/${currentUser}`;
    } else if (currentDir.startsWith('~')) {
        return `/home/${currentUser}${currentDir.slice(1)}`;
    } else {
        return currentDir;
    }
}

function resolvePath(inputPath) {
    if (inputPath.startsWith('/')) {
        return inputPath;
    } else if (inputPath.startsWith('~')) {
        return `/home/${currentUser}${inputPath.slice(1)}`;
    } else {
        return `${getCurrentPath()}/${inputPath}`;
    }
}

function updatePrompt() {
    if (isRoot) {
        promptElement.textContent = `root@electron:${currentDir}# `;
        promptElement.style.color = 'red';
    } else {
        promptElement.textContent = `${currentUser}@electron:${currentDir}$ `;
        promptElement.style.color = 'cyan';
    }
}

function formatOutput(output) {
    return output.map(item => {
        if (item.includes('.')) {
            return `<span style="color:pink;">${item}</span>`;
        } else {
            return `<span style="color:lightblue;">${item}</span>`;
        }
    }).join(' ');
}

function isProtectedDir(path) {
    if (path === '/') {
        return false;
    }
    return rootDirectories['/'].some(dir => path.startsWith(`/${dir}`));
}

async function executeCommand(command) {
    if (!command.trim()) {
        return '';
    }

    let output = '';
    let args = command.split(' ');
    let cmd = args[0];
    let filesystem = JSON.parse(localStorage.getItem('filesystem'));
    let path = getCurrentPath();

    switch (cmd) {
        case 'sudo':
            if (args[1] === 'su') {
                let password = prompt("Enter password for sudo: ");
                if (password === '12345') {
                    isRoot = true;
                    authenticated = true;
                    currentUser = 'root';
                    currentDir = '/';
                } else {
                    output = 'Authentication failure. Hint: 12345';
                }
            } else if ((args[1] === 'apt' && args[2] === 'update') || (args[1] === 'update')) {
                if (!authenticated) {
                    let password = prompt("Enter password for sudo: ");
                    if (password === '12345') {
                        authenticated = true;
                    } else {
                        output = 'Authentication failure. Hint: 12345';
                        break;
                    }
                }
                output = 'Updating package lists...\n[=========>.........] 50%\nUpdating package lists... Done.';
            } else if ((args[1] === 'apt' && args[2] === 'upgrade') || (args[1] === 'upgrade')) {
                if (!authenticated) {
                    let password = prompt("Enter password for sudo: ");
                    if (password === '12345') {
                        authenticated = true;
                    } else {
                        output = 'Authentication failure. Hint: 12345';
                        break;
                    }
                }
                if (args.includes('-y')) {
                    output = 'Upgrading packages...\n[====================] 100%\nUpgrading packages... Done.';
                } else {
                    let confirm = prompt("Do you want to continue? [Y/n]");
                    if (confirm.toLowerCase() === 'y') {
                        output = 'Upgrading packages...\n[====================] 100%\nUpgrading packages... Done.';
                    } else {
                        output = 'Operation cancelled.';
                    }
                }
            } else {
                output = `Command not found: ${command}`;
            }
            break;
        case 'apt':
            if (args[1] === 'update') {
                output = 'Updating package lists...\n[=========>.........] 50%\nUpdating package lists... Done.';
            } else if (args[1] === 'upgrade') {
                if (args.includes('-y')) {
                    output = 'Upgrading packages...\n[====================] 100%\nUpgrading packages... Done.';
                } else {
                    let confirm = prompt("Do you want to continue? [Y/n]");
                    if (confirm.toLowerCase() === 'y') {
                        output = 'Upgrading packages...\n[====================] 100%\nUpgrading packages... Done.';
                    } else {
                        output = 'Operation cancelled.';
                    }
                }
            } else {
                output = `Command not found: ${command}`;
            }
            break;
        case 'ls':
            let dirToDisplay = args[1] ? resolvePath(args[1]) : path;
            if (isRoot && isProtectedDir(dirToDisplay)) {
                output = `ls: cannot access '${args[1]}': Permission denied`;
            } else if (filesystem[dirToDisplay]) {
                output = formatOutput(filesystem[dirToDisplay]);
            } else {
                output = `ls: cannot access '${args[1]}': No such file or directory`;
            }
            break;
        case 'cd':
            if (args[1]) {
                let newPath = resolvePath(args[1]);
                if (isRoot && isProtectedDir(newPath)) {
                    output = `bash: cd: ${args[1]}: Permission denied`;
                } else if (filesystem[newPath]) {
                    currentDir = newPath === '/' ? '/' : newPath.replace(`/home/${currentUser}`, '~');
                } else {
                    output = `bash: cd: ${args[1]}: No such file or directory`;
                }
            } else {
                currentDir = '~';
            }
            break;
        case 'pwd':
            output = getCurrentPath();
            break;
        case 'whoami':
            output = currentUser;
            break;
        case 'uname':
            if (args[1] === '-a') {
                output = 'Electron v1.1.3 beta by Hrishav';
            } else {
                output = 'Usage: uname -a';
            }
            break;
        case 'python':
            if (args[1] === '--version') {
                output = 'Python 3.8.5';
            } else {
                output = 'Usage: python --version';
            }
            break;
        case 'adduser':
            if (args[1]) {
                let newUser = args[1];
                let password1 = prompt(`Set a new password: `);
                let password2 = prompt(`Enter the password again: `);
                if (password1 === password2) {
                    users[newUser] = password1;
                    localStorage.setItem('users', JSON.stringify(users));
                    filesystem[`/home/${newUser}`] = homeDirectories;
                    homeDirectories.forEach(dir => {
                        filesystem[`/home/${newUser}/${dir}`] = [];
                    });
                    localStorage.setItem('filesystem', JSON.stringify(filesystem));
                    output = `Added user ${newUser}.`;
                } else {
                    output = `Passwords do not match. Try again.`;
                }
            } else {
                output = 'Usage: adduser <username>';
            }
            break;
        case 'login':
            if (args[1]) {
                let user = args[1];
                let password = prompt(`Password: `);
                if (users[user] && users[user] === password) {
                    currentUser = user;
                    currentDir = '~';
                    output = `Logged in as ${user}`;
                } else {
                    output = 'Login incorrect';
                }
            } else {
                output = 'Usage: login <username>';
            }
            break;
        case 'exit':
            if (isRoot) {
                isRoot = false;
                authenticated = false;
                currentUser = 'user';
                currentDir = '~';
            } else {
                output = 'No more processes left to exit.';
            }
            break;
        case 'clear':
            outputElement.innerHTML = '';
            return '';
        case 'ifconfig':
            output = `eth0: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>  mtu 1500
    inet 192.168.1.100  netmask 255.255.255.0  broadcast 192.168.1.255
    inet6 fe80::a00:27ff:fe4e:66a1  prefixlen 64  scopeid 0x20<link>
    ether 08:00:27:4e:66:a1  txqueuelen 1000  (Ethernet)
    RX packets 215265  bytes 327264500 (312.1 MiB)
    RX errors 0  dropped 0  overruns 0  frame 0
    TX packets 155209  bytes 14030524 (13.3 MiB)
    TX errors 0  dropped 0 overruns 0  carrier 0  collisions 0

lo: flags=73<UP,LOOPBACK,RUNNING>  mtu 65536
    inet 127.0.0.1  netmask 255.0.0.0
    inet6 ::1  prefixlen 128  scopeid 0x10<host>
    loop  txqueuelen 1000  (Local Loopback)
    RX packets 0  bytes 0 (0.0 B)
    RX errors 0  dropped 0  overruns 0  frame 0
    TX packets 0  bytes 0 (0.0 B)
    TX errors 0  dropped 0 overruns 0  carrier 0  collisions 0`;
            break;
        case 'nano':
            if (args[1]) {
                let fileName = args[1];
                let filePath = resolvePath(fileName);
                let content = filesystem[filePath] || '';
                content = prompt('Enter file content: ', content);
                filesystem[filePath] = content;
                let dir = filePath.substring(0, filePath.lastIndexOf('/'));
                if (!filesystem[dir].includes(fileName)) {
                    filesystem[dir].push(fileName);
                }
                localStorage.setItem('filesystem', JSON.stringify(filesystem));
                output = `Created file ${fileName}.`;
            } else {
                output = 'Usage: nano <filename>';
            }
            break;
        case 'cat':
            let fileToRead = args[1] ? resolvePath(args[1]) : '';
            if (isRoot && isProtectedDir(fileToRead)) {
                output = `cat: ${args[1]}: Permission denied`;
            } else if (filesystem[fileToRead]) {
                output = filesystem[fileToRead];
            } else {
                output = `cat: ${args[1]}: No such file or directory`;
            }
            break;
        case 'mkdir':
            if (args[1]) {
                let dirName = args[1];
                let dirPath = resolvePath(dirName);
                filesystem[dirPath] = [];
                let parentDir = dirPath.substring(0, dirPath.lastIndexOf('/'));
                if (!filesystem[parentDir].includes(dirName)) {
                    filesystem[parentDir].push(dirName);
                }
                localStorage.setItem('filesystem', JSON.stringify(filesystem));
                output = `Created directory ${dirName}.`;
            } else {
                output = 'Usage: mkdir <directory>';
            }
            break;
        case 'rmdir':
            if (args[1]) {
                let dirName = args[1];
                let dirPath = resolvePath(dirName);
                if (isRoot && isProtectedDir(dirPath)) {
                    output = `rmdir: failed to remove '${dirName}': Permission denied`;
                } else if (filesystem[dirPath] && filesystem[dirPath].length === 0) {
                    delete filesystem[dirPath];
                    let parentDir = dirPath.substring(0, dirPath.lastIndexOf('/'));
                    filesystem[parentDir] = filesystem[parentDir].filter(dir => dir !== dirName);
                    localStorage.setItem('filesystem', JSON.stringify(filesystem));
                    output = `Removed directory ${dirName}.`;
                } else {
                    output = `rmdir: failed to remove '${dirName}': Directory not empty or does not exist.`;
                }
            } else {
                output = 'Usage: rmdir <directory>';
            }
            break;
        case 'rm':
            if (args[1] === '-rf' && args[2]) {
                let targetPath = resolvePath(args[2]);
                if (isRoot && isProtectedDir(targetPath)) {
                    output = `rm: cannot remove '${args[2]}': Permission denied`;
                } else if (filesystem[targetPath]) {
                    function deleteRecursively(path) {
                        if (Array.isArray(filesystem[path])) {
                            filesystem[path].forEach(item => deleteRecursively(`${path}/${item}`));
                        }
                        delete filesystem[path];
                    }
                    deleteRecursively(targetPath);
                    let parentDir = targetPath.substring(0, targetPath.lastIndexOf('/'));
                    filesystem[parentDir] = filesystem[parentDir].filter(item => item !== args[2]);
                    localStorage.setItem('filesystem', JSON.stringify(filesystem));
                    output = `Removed ${args[2]}`;
                } else {
                    output = `rm: cannot remove '${args[2]}': No such file or directory`;
                }
            } else if (args[1]) {
                let fileName = args[1];
                let filePath = resolvePath(fileName);
                if (isRoot && isProtectedDir(filePath)) {
                    output = `rm: cannot remove '${fileName}': Permission denied`;
                } else if (filesystem[filePath]) {
                    delete filesystem[filePath];
                    let parentDir = filePath.substring(0, filePath.lastIndexOf('/'));
                    filesystem[parentDir] = filesystem[parentDir].filter(file => file !== fileName);
                    localStorage.setItem('filesystem', JSON.stringify(filesystem));
                    output = `Removed file ${fileName}.`;
                } else {
                    output = `rm: cannot remove '${fileName}': No such file`;
                }
            } else {
                output = 'Usage: rm <file>';
            }
            break;
        case 'trace':
            if (args[1] === '-m') {
                output = await fetchIpInfo();
            } else if (args[1] === '-t' && args[2]) {
                const targetIp = args[2];
                output = await fetchIpInfo(targetIp);
            } else {
                output = 'Usage: trace -m | trace -t <IP address>';
            }
            break;
        default:
            output = `Command not found: ${command}`;
    }
    return output;
}

async function fetchIpInfo(ip = '') {
    const response = await fetch(`https://ipapi.co/${ip}/json/`);
    const data = await response.json();
    const { ip: ipAddress, city, region, country_name, timezone, org, asn, latitude, longitude, utc_offset } = data;
    const localTime = new Date().toLocaleString('en-US', { timeZone: timezone });

    return `IP: ${ipAddress}
City: ${city}
Region: ${region}
Country: ${country_name}
Timezone: ${timezone}
Local Time: ${localTime}
ISP: ${org}
ASN: ${asn}
Latitude: ${latitude}
Longitude: ${longitude}`;
}

inputElement.addEventListener('keydown', async function (event) {
    if (event.key === 'Enter') {
        let command = inputElement.value;
        let output = await executeCommand(command);
        if (output) {
            outputElement.innerHTML += `<div><span style="color:${promptElement.style.color};">${promptElement.textContent}</span> ${command}</div><div style="color:lime; text-align:left;">${output}</div>`;
        } else {
            outputElement.innerHTML += `<div><span style="color:${promptElement.style.color};">${promptElement.textContent}</span> ${command}</div>`;
        }
        inputElement.value = '';
        updatePrompt();
        outputElement.scrollTop = outputElement.scrollHeight;
    }
});

initializeFilesystem();
updatePrompt();
