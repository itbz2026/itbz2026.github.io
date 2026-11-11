---
title: "Storage & Datenspeicher"
description: "Directory, LVM-thin, ZFS, NFS, SMB, iSCSI und Storage-Diagnose in Proxmox VE."
category: "Proxmox"
slug: "proxmox-storage"
---

# Storage & Datenspeicher

**Geltungsbereich:** Proxmox VE. Befehle auf dem Proxmox-Host ausführen, sofern nicht anders angegeben. Syntax und Funktionen können versionsabhängig sein; lokale Hilfe und offizielle Dokumentation prüfen.

## Storage-Status und IDs

```bash
pvesm status
pvesm scan nfs <SERVER>
pvesm help
```

`pvesm status` zeigt konfigurierte Storage-Ziele und deren Belegung. Scan-Befehle dienen der Erkennung verfügbarer Backends; konkrete Syntax mit `pvesm help` prüfen.

> Storage-IDs sind Proxmox-Konfigurationsnamen, keine Linux-Gerätenamen.

## LVM und LVM-thin prüfen

```bash
pvs
vgs
lvs -a -o +devices,seg_monitor
```

Zeigt Physical Volumes, Volume Groups und Logical Volumes. Thin-Pools auf Auslastung überwachen.

> Ein voller Thin-Pool kann laufende Gäste beeinträchtigen. Vor Änderungen freien Platz, Metadaten und Backup prüfen.

## ZFS-Zustand prüfen

```bash
zpool status -v
zpool list
zfs list -o name,used,avail,refer,mountpoint
```

Zeigt Pool-Health, Kapazität und Dataset-Belegung. `DEGRADED` und `FAULTED` zeitnah untersuchen.

> Keine Pool-Reparatur oder Disk-Ersetzung ohne Geräteidentifikation, Backup und passende ZFS-Prozedur.

## NFS und SMB/CIFS

NFS/SMB Storage wird über **Datacenter → Storage** eingebunden. Server, Export/Freigabe, Berechtigungen, Netzwerk und Content-Typen korrekt konfigurieren.

```bash
pvesm status
findmnt
mount | grep -E 'nfs|cifs'
```

> Zugangsdaten nicht in Skripten oder öffentlich lesbaren Dateien speichern. Shared Storage muss für alle vorgesehenen Nodes konsistent erreichbar sein.

## Storage-Troubleshooting

Prüfe Erreichbarkeit, Mounts, Kernelmeldungen, Belegung und Proxmox-Tasks.

```bash
pvesm status
df -hT
lsblk -f
journalctl -k -b --no-pager | tail -100
```

> Nicht einfach Storage-Verzeichnisse löschen oder Datenträger neu formatieren. Zuerst VM-Disks, Backups und Storage-Content identifizieren.

## Storage-Inhalt auflisten

Storage-Inhalte anzeigen und mit VM-/Container-Konfigurationen abgleichen.

```bash
pvesm status
pvesm list <STORAGE_ID>
qm list
pct list
```

Vor Entfernen eines Storage prüfen, ob VM-Disks, Rootfs, ISOs oder Backups darauf liegen.

## SMART und Datenträgergesundheit

SMART-Werte regelmäßig kontrollieren; `smartmontools` muss gegebenenfalls installiert sein.

```bash
lsblk -o NAME,SIZE,MODEL,SERIAL
smartctl -a /dev/sdX
smartctl -x /dev/nvme0
```

Gerätenamen sorgfältig verifizieren. SMART ist ein Frühwarnsystem, keine Garantie gegen Ausfälle.

> **Betriebssicherheit:** Destruktive Änderungen an Storage, Netzwerk, Cluster oder Gastkonfiguration nur mit geprüftem Backup, Wartungsplan und Rückweg durchführen.

## Weiterführende Dokumentation

- [Proxmox VE Administration Guide](https://pve.proxmox.com/pve-docs/)
- [Proxmox VE Storage Documentation](https://pve.proxmox.com/pve-docs/chapter-pvesm.html)
