echo -e "\nStarting post creat command script..."
echo "Dev machine:"
uname -a
echo -e "\nInstalling watchman...\n"
sudo apt update
sudo apt install -y watchman
watchman version

echo -e "\n*******************************"
echo -e "\nDev container ready!".
echo -e "\n*******************************\n"