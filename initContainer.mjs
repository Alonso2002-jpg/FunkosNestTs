import { exec } from 'node:child_process'
const reiniciarContenedor = () => {
  exec(
    'docker stop funkos-db_postgres && docker rm funkos-db_postgres',
    (error, stdout) => {
      if (error) {
        console.error(`Error al detener o eliminar el contenedor: ${error}`)
        return
      }
      console.log(`Contenedor detenido y eliminado: ${stdout}`)
      exec('docker-compose up -d', (error, stdout) => {
        if (error) {
          console.error(`Error al iniciar el contenedor: ${error}`)
          return
        }
        console.log(`Contenedor iniciado: ${stdout}`)
      })
    },
  )
}
// Llamamos al método para reiniciar el contenedor al iniciar el programa
reiniciarContenedor()
