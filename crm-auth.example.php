<?php
/* crm-auth.example.php — template. Copy to crm-auth.php (gitignored) and
   set real bcrypt hashes. Generate one with:
     php -r "echo password_hash('THE_PASSWORD', PASSWORD_DEFAULT);"
   Keys are lowercase usernames. */

$CRM_USERS = [
  'username' => 'PASTE_BCRYPT_HASH_HERE',
];
