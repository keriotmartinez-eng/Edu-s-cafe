from django.conf import settings
from django.db import models


class Lead(models.Model):
    class Estado(models.TextChoices):
        NUEVO = "nuevo", "Nuevo"
        CONTACTADO = "contactado", "Contactado"
        COTIZADO = "cotizado", "Cotizado"
        GANADO = "ganado", "Ganado"
        PERDIDO = "perdido", "Perdido"

    class Fuente(models.TextChoices):
        INSTAGRAM = "instagram", "Instagram"
        FACEBOOK = "facebook", "Facebook"
        WHATSAPP = "whatsapp", "WhatsApp"
        SITIO_WEB = "sitio_web", "Sitio web"
        REFERIDO = "referido", "Referido"
        OTRO = "otro", "Otro"

    nombre = models.CharField(max_length=150)
    correo = models.EmailField(max_length=254)
    telefono = models.CharField(max_length=20)
    interes = models.CharField(max_length=200)
    mensaje = models.TextField(blank=True)
    fuente = models.CharField(
        max_length=20,
        choices=Fuente.choices
    )
    estado = models.CharField(
        max_length=20,
        choices=Estado.choices,
        default=Estado.NUEVO
    )
    asignado_a = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="leads_asignados"
    )
    creado_en = models.DateTimeField(auto_now_add=True)
    actualizado_en = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-creado_en"]

    def __str__(self):
        return self.nombre


class Interaccion(models.Model):
    class Tipo(models.TextChoices):
        LLAMADA = "llamada", "Llamada"
        WHATSAPP = "whatsapp", "WhatsApp"
        CORREO = "correo", "Correo"
        REUNION = "reunion", "Reunión"

    lead = models.ForeignKey(
        Lead,
        on_delete=models.CASCADE,
        related_name="interacciones"
    )
    tipo = models.CharField(
        max_length=20,
        choices=Tipo.choices
    )
    nota = models.TextField()
    fecha = models.DateTimeField()
    registrado_por = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name="interacciones_registradas"
    )

    class Meta:
        ordering = ["-fecha"]
        verbose_name = "Interacción"
        verbose_name_plural = "Interacciones"

    def __str__(self):
        return f"{self.lead.nombre} - {self.tipo}"